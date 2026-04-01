/**
 * Pads a number with a leading zero when needed. Used toformate dates so month/day values
 * always have two digits.
 *
 * Example:
 *  - 3  -> "03"
 *  - 12 -> "12"
 *
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
 */
export const formatDate = (d: Date) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`

/**
 * Returns a new Date object with the same year, month, and day,
 * but with the time reset to midnight (00:00:00).
 *
 * Example:
 *  If d is "2026-03-05 14:37:20",
 *  this returns "2026-03-05 00:00:00"
 */
export const resetHours = (d: Date) => {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0)
}