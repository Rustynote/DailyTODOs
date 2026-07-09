/**
 * Pads a number with a leading zero when needed. Used toformate dates so month/day values
 * always have two digits.
 *
 * Example:
 *  - 3  -> "03"
 *  - 12 -> "12"
 *
 * @param n Number to format.
 * @returns Two-character string representation of the number.
 */
const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * Formats a Date object into a YYYY-MM-DD string.
 *
 * Example:
 *  new Date(2026, 2, 5) -> "2026-03-05"
 *
 * Notes:
 *  - getMonth() is zero-based in JavaScript:
 *    January = 0, February = 1, etc.
 *    That is why + 1 is required.
 *
 * @param d Date object to format.
 * @returns Date string in `YYYY-MM-DD` format.
 */
export const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

/**
 * Returns a new Date object with the same year, month, and day,
 * but with the time reset to midnight (00:00:00).
 *
 * Example:
 *  If d is "2026-03-05 14:37:20",
 *  this returns "2026-03-05 00:00:00"
 *
 * @param d Date object to normalize.
 * @returns New Date set to the same day at `00:00:00`.
 */
export const resetHours = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)

/**
 * Return a localized month and year label for a given date.
 *
 * The result uses the runtime's default locale and formats the date using:
 * - the full month name
 * - the numeric year
 *
 * Example output may look like:
 * - `April 2026`
 * - `април 2026.`
 *
 * The exact text depends on the user's locale settings.
 *
 * @param d Date object to format.
 * @returns Localized string containing the month name and year.
 */
export const monthName = (d: Date) => d.toLocaleString(undefined, {month: 'long', year: 'numeric'})

/**
 * Calculate the ISO-style week number for a given date.
 *
 * The function normalizes the date to UTC to avoid timezone-related edge cases,
 * shifts the date to the Thursday of the same week, and then calculates the
 * week index relative to the start of the year.
 *
 * The returned value is prefixed with `"Week "`, making it suitable for direct
 * display in the UI.
 *
 * Example output:
 * - `Week 1`
 * - `Week 14`
 *
 * @param d Date object for which the week number should be determined.
 * @returns String label containing the calculated week number.
 */
export const weekNumber = (d: any) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    return 'Week ' + Math.ceil((((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7);
};