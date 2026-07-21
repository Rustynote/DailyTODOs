import {writable} from 'svelte/store';

/**
 * Key used to store settings in the browser's localStorage.
 */
const LS_KEY = 'settings';

/**
 * Default UI/settings values used on first run, and also as a fallback
 * when stored settings are missing keys or can't be parsed.
 *
 * Note: SSR is off, so we can safely read `window` and `localStorage`
 * at module evaluation time (this runs in the browser).
 */
const defaultSettings = {
    /**
     * If true, weekend days are hidden in the calendar UI.
     */
    hideWeekend: true,

    /**
     * Day the calendar week starts on.
     * One of the values in `$lib/vars`' `weekStartOptions`.
     */
    weekStart: 'monday',

    /**
     * If true, completed items are still shown.
     */
    showDone: true,
    
    /**
     * Active calendar view mode.
     * Expected values are app-defined (e.g. 'month', 'week', 'day').
     */
    view: 'month',
    
    /**
     * Initial theme preference.
     * Reads the OS/browser "prefers-color-scheme" media query.
     *
     * Important: this is only the initial value. If you want the app to react
     * to OS theme changes while running, you'll need to add a listener to the
     * MediaQueryList and update the store accordingly.
     *
     * Falls back to `false` when there's no `window` (e.g. the root route is
     * SSR-prerendered so its <svelte:head> tags land in the static HTML).
     */
    isDark: typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
};

/**
 * Defensive merge: if `parsed` is an object, ensure all keys from
 * `defaultSettings` exist on it, filling in any that are missing.
 *
 * This keeps backwards compatibility when you add new settings later:
 * older stored payloads won't have the new keys, so we fill them in. Falls
 * back entirely to `defaultSettings` when `parsed` isn't a plain object.
 *
 * @param {any} parsed Settings object to merge, typically freshly parsed from JSON.
 * @returns `parsed` with any missing keys filled in from `defaultSettings`.
 */
function mergeWithDefaults(parsed) {
    if (typeof parsed !== 'object' || parsed === null) {
        return defaultSettings;
    }

    for (let key in defaultSettings) {
        /**
         * TypeScript note:
         * Accessing dynamic keys on a typed object often triggers index
         * signature errors; the existing code uses @ts-ignore to silence it.
         */
        // @ts-ignore
        if (defaultSettings.hasOwnProperty(key) && typeof parsed[key] === 'undefined') {
            // @ts-ignore
            parsed[key] = defaultSettings[key];
        }
    }

    return parsed;
}

/**
 * `initSettings` is what we will actually seed the store with.
 * It starts as defaults, then we try to override/merge from localStorage.
 */
let initSettings = defaultSettings;

/**
 * Read any previously persisted settings from localStorage.
 * localStorage stores strings, so we parse JSON back into an object.
 *
 * Guarded on `window` rather than `localStorage` directly: some SSR
 * environments (e.g. newer Node) expose a non-functional global
 * `localStorage` stub, so checking `window` is the reliable "are we in a
 * browser" check. SSR happens for the root route so its <svelte:head> tags
 * land in the static HTML.
 */
const storedSettings = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
if (storedSettings) {
    try {
        initSettings = mergeWithDefaults(JSON.parse(storedSettings));
    } catch (e) {
        /**
         * If parsing fails (corrupt value, partial write, manual edits, etc.),
         * fall back to defaults and log the error for debugging.
         */
        initSettings = defaultSettings;
        console.error('Error parsing stored settings:', e);
    }
}

/**
 * Exported Svelte store holding the current settings.
 * Components can subscribe via `$settings` and update via `settings.set/update`.
 */
export const settings = writable(initSettings);

/**
 * Persist settings to localStorage on every change.
 *
 * Note: `subscribe` is called immediately with the current value,
 * so this also writes once on initialization (useful for normalizing
 * settings after merging defaults).
 *
 */
settings.subscribe(value => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(LS_KEY, JSON.stringify(value));
    }
});

/**
 * Keep this tab's settings in sync with changes made in other tabs.
 *
 * The `storage` event only fires on tabs other than the one that made the
 * change, so this doesn't loop back on our own `subscribe` write above.
 * `key` is `null` when another tab calls `localStorage.clear()` (see the
 * "Remove Data" setting), in which case we fall back to defaults.
 */
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key !== null && e.key !== LS_KEY) return;

        try {
            settings.set(e.newValue ? mergeWithDefaults(JSON.parse(e.newValue)) : defaultSettings);
        } catch (err) {
            console.error('Failed to sync settings from another tab', err);
        }
    });
}
