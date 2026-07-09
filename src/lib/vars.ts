import {writable} from 'svelte/store';
import {get} from 'svelte/store';
import {resetHours} from "$lib/date";
import {settings} from "$lib/settings";

const storedSettings = get(settings);

export const views: string[] = ['month', 'week', 'day'];

export const today: Date = resetHours(new Date());

export const currentDate = writable(today);
export const selectedDate = writable(today);


const weekDaysShortRaw: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const weekDaysShort = storedSettings.hideWeekend ? weekDaysShortRaw.splice(0, 5) : weekDaysShortRaw;