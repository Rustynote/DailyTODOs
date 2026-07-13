/**
 * Return the Monday of the week containing the given date, at midnight.
 *
 * Note: `getDay()` returns 0 for Sunday, so `(getDay() + 6) % 7` remaps the
 * week to start on Monday (Monday=0 ... Sunday=6).
 *
 * @param d Date object belonging to the target week.
 * @returns New Date set to that week's Monday at `00:00:00`.
 */
export const startOfWeek = (d: Date): Date => {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // Monday=0

    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    return date;
}

/**
 * Return the last visible day of the week containing the given date.
 *
 * When weekends are hidden, the week ends on Friday (4 days after Monday);
 * otherwise it ends on Sunday (6 days after Monday).
 *
 * @param d Date object belonging to the target week.
 * @param hideWeekend Whether weekend days are excluded from the view.
 * @returns New Date representing the last day of the week.
 */
export const endOfWeek = (d: Date, hideWeekend: boolean): Date => {
    const start = startOfWeek(d);
    const date = new Date(start);
    const days = hideWeekend ? 4 : 6;

    date.setDate(start.getDate() + days);

    return date;
}

/**
 * Return the first day shown in a month view grid, at midnight.
 *
 * This is the Monday of the week containing the 1st of the month, so the
 * grid can always start on a Monday even when the month itself doesn't.
 *
 * @param firstOfMonth Any date within the target month.
 * @returns New Date set to the grid's first visible day at `00:00:00`.
 */
export const startOfMonthGrid = (firstOfMonth: Date): Date => {
    const date = new Date(firstOfMonth);
    date.setDate(1);

    const dow = (date.getDay() + 6) % 7; // Monday=0

    date.setDate(1 - dow);
    date.setHours(0, 0, 0, 0);

    return date;
}

/**
 * Return the last day shown in a month view grid.
 *
 * A month grid always spans 6 full weeks (42 days) so the layout stays a
 * consistent size regardless of how the month falls across weeks.
 *
 * @param firstOfMonth Any date within the target month.
 * @returns New Date representing the grid's last visible day.
 */
export const endOfMonthGrid = (firstOfMonth: Date): Date => {
    const start = startOfMonthGrid(firstOfMonth);
    const date = new Date(start);

    date.setDate(date.getDate() + 41); // 6 weeks * 7 - 1

    return date;
}

/**
 * Return the number of days shown per week, based on whether weekends
 * are hidden.
 *
 * @param hideWeekend Whether weekend days are excluded from the view.
 * @returns `5` when weekends are hidden, otherwise `7`.
 */
export const daysInWeek = (hideWeekend: boolean): number => hideWeekend ? 5 : 7;

/**
 * Build the list of days to render for a calendar grid, from `start` to `end`.
 *
 * In month view, this also trims trailing rows that belong entirely to the
 * next month: once past the 10th day, if a Monday is reached that falls in
 * a different month than `current`, the days accumulated since the last
 * full row are discarded and iteration stops at the next month boundary.
 * Week view always returns the full range without this trimming.
 *
 * @param start First date in the range (inclusive).
 * @param end Last date in the range (inclusive).
 * @param current Date representing the month/period currently being displayed.
 * @param view Active calendar view (e.g. `'month'`, `'week'`, `'day'`).
 * @param hideWeekend Whether weekend days are excluded from the range.
 * @returns Array of Date objects to display in the grid.
 */
export const rangeDays = (start: Date, end: Date, current: Date, view: string, hideWeekend: boolean): Date[] => {
    const diw = daysInWeek(hideWeekend);
    const d = new Date(start);
    let days: Date[] = [];
    let i = 0;

    while(d <= end) {
        if(view !== 'week' && i > 10 && d.getDay() === 1 && d.getMonth() !== current.getMonth()) {
            break;
        }

        // Skip sunday and saturday if hide weekend
        if(hideWeekend && [6].includes(d.getDay())) {
            d.setDate(d.getDate() + 2);

            continue;
        }

        if(view !== 'week' && d.getMonth() !== current.getMonth() && i === diw - 1) {
            days = [];
            i++;

            d.setDate(d.getDate() + 1);

            continue;
        }

        days.push(new Date(d));
        d.setDate(d.getDate() + 1);

        i++;

        // stop while if it's end of the week in next month
        if(view !== 'week' && i > 10 && i % diw == 0 && d.getMonth() !== current.getMonth()) {
            break;
        }
    }

    return days;
}
