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
 * Short weekday labels, Monday-first, used as column headers in the
 * calendar grid.
 *
 * Note: this is the full 7-day list; components that hide weekends slice
 * it down to the first 5 entries.
 */
export const weekDaysShortRaw: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
