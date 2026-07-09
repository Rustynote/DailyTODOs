import {get} from 'svelte/store';
import {writable} from 'svelte/store';
import {settings} from "$lib/settings";
import {today} from "$lib/vars";

const storedSettings = get(settings);

const diw = storedSettings.hideWeekend ? 5 : 7;

const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = (date.getDay() + 6) % 7; // Monday=0

    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    return date;
}

const endOfWeek = (d: Date) => {
    const start = startOfWeek(d);
    const date = new Date(start);
    const days = storedSettings.hideWeekend ? 4 : 6;

    date.setDate(start.getDate() + days);

    return date;
}

const startOfMonthGrid = (firstOfMonth: Date) => {
    firstOfMonth.setDate(1);

    const date = new Date(firstOfMonth);
    const dow = (date.getDay() + 6) % 7; // Monday=0

    date.setDate(1 - dow);
    date.setHours(0, 0, 0, 0);

    return date;
}

const endOfMonthGrid = (firstOfMonth: Date) => {
    const start = startOfMonthGrid(firstOfMonth);
    const date = new Date(start);

    date.setDate(date.getDate() + 41); // 6 weeks * 7 - 1

    return date;
}

const rangeDays = (start: Date, end: Date, current: Date) => {
    const d = new Date(start);
    let days: Date[] = [];
    let i = 0;

    while(d <= end) {
        if(storedSettings.view !== 'week' && i > 10 && d.getDay() === 1 && d.getMonth() !== current.getMonth()) {
            break;
        }

        // Skip sunday and saturday if hide weekend
        if(storedSettings.hideWeekend && [6].includes(d.getDay())) {
            d.setDate(d.getDate() + 2);

            continue;
        }

        if(storedSettings.view !== 'week' && d.getMonth() !== current.getMonth() && i === diw - 1) {
            days = [];
            i++;

            d.setDate(d.getDate() + 1);

            continue;
        }

        days.push(new Date(d));
        d.setDate(d.getDate() + 1);

        i++;

        // stop while if it's end of the week in next month
        if(storedSettings.view !== 'week' && i > 10 && i % diw == 0 && d.getMonth() !== current.getMonth()) {
            break;
        }
    }

    return days;
}
