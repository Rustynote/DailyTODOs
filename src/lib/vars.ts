import {writable} from 'svelte/store';
import {resetHours} from "$lib/date";

/**
 * All calendar view modes supported by the app, in the order they are
 * offered in the view selector.
 */
export const views: string[] = ['month', 'week', 'day'];

/**
 * The current day, normalized to midnight.
 *
 * Computed once at module load time and used as the baseline for the
 * "reset to today" action and for highlighting today's cell in the grid.
 */
export const today: Date = resetHours(new Date());

/**
 * Svelte store holding the month/day currently being displayed.
 *
 * This drives which month (or week/day) the calendar grid renders, and is
 * distinct from `selectedDate`, which tracks the user's clicked-on day.
 */
export const currentDate = writable(new Date(today));

/**
 * Svelte store holding the day the user has selected.
 *
 * Used to highlight the active cell and to determine the visible range in
 * week/day views.
 */
export const selectedDate = writable(new Date(today));

/**
 * Short weekday labels indexed by JavaScript's `Date#getDay()` (0 = Sunday
 * ... 6 = Saturday), used to build the calendar's weekday header regardless
 * of which day the week is configured to start on.
 */
export const weekDayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Options offered by the "start of week" setting, in the order shown in the
 * settings dropdown.
 */
export const weekStartOptions: string[] = ['saturday', 'sunday', 'monday'];

/**
 * Options offered by the "theme" setting, in the order shown in the
 * settings dropdown. Each name is a Tailwind gray-scale color family that
 * the app's semantic color tokens (see app.css) are re-mapped onto.
 */
export const themeOptions: string[] = [
    'amber',
    'blue',
    'cyan',
    'emerald',
    'fuchsia',
    'gray',
    'green',
    'indigo',
    'lime',
    'neutral',
    'orange',
    'pink',
    'purple',
    'red',
    'rose',
    'sky',
    'slate',
    'stone',
    'teal',
    'violet',
    'yellow',
    'zinc',
];

/**
 * Maps a `weekStartOptions` value to the corresponding `Date#getDay()` index.
 */
export const weekStartDayIndex: Record<string, number> = {
    sunday: 0,
    monday: 1,
    saturday: 6
};

/**
 * Svelte store tracking whether the settings panel is open.
 *
 * The panel is rendered alongside the calendar rather than as a separate
 * route, so this just toggles its visibility.
 */
export const isSettingsOpen = writable(false);
