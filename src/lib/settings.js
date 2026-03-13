import { writable } from 'svelte/store';

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
     */
    isDark: window.matchMedia('(prefers-color-scheme: dark)').matches
};

/**
 * `initSettings` is what we will actually seed the store with.
 * It starts as defaults, then we try to override/merge from localStorage.
 */
let initSettings = defaultSettings;

/**
 * Read any previously persisted settings from localStorage.
 * localStorage stores strings, so we parse JSON back into an object.
 */
const storedSettings = localStorage.getItem('settings');
if (storedSettings) {
    try {
        // Attempt to parse the stored JSON string into an object.
        initSettings = JSON.parse(storedSettings);
        
        /**
         * Defensive merge: if the parsed value is an object, ensure
         * all keys from `defaultSettings` exist on `initSettings`.
         *
         * This keeps backwards compatibility when you add new settings later:
         * older stored payloads won't have the new keys, so we fill them in.
         */
        if (typeof initSettings === 'object') {
            for (let key in defaultSettings) {
                /**
                 * TypeScript note:
                 * Accessing dynamic keys on a typed object often triggers index
                 * signature errors; the existing code uses @ts-ignore to silence it.
                 */
                // @ts-ignore
                if (defaultSettings.hasOwnProperty(key) && typeof initSettings[key] === 'undefined') {
                    // @ts-ignore
                    initSettings[key] = defaultSettings[key];
                }
            }
        }
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
    localStorage.setItem('settings', JSON.stringify(value));
});
