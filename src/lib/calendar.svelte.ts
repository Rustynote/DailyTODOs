export const startOfWeek = (d: Date): Date => {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // Monday=0

    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    return date;
}

export const endOfWeek = (d: Date, hideWeekend: boolean): Date => {
    const start = startOfWeek(d);
    const date = new Date(start);
    const days = hideWeekend ? 4 : 6;

    date.setDate(start.getDate() + days);

    return date;
}

export const startOfMonthGrid = (firstOfMonth: Date): Date => {
    const date = new Date(firstOfMonth);
    date.setDate(1);

    const dow = (date.getDay() + 6) % 7; // Monday=0

    date.setDate(1 - dow);
    date.setHours(0, 0, 0, 0);

    return date;
}

export const endOfMonthGrid = (firstOfMonth: Date): Date => {
    const start = startOfMonthGrid(firstOfMonth);
    const date = new Date(start);

    date.setDate(date.getDate() + 41); // 6 weeks * 7 - 1

    return date;
}

export const daysInWeek = (hideWeekend: boolean): number => hideWeekend ? 5 : 7;

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
