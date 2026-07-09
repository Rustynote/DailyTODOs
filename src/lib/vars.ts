import {writable} from 'svelte/store';
import {resetHours} from "$lib/date";

export const views: string[] = ['month', 'week', 'day'];

export const today: Date = resetHours(new Date());

export const currentDate = writable(new Date(today));
export const selectedDate = writable(new Date(today));

export const weekDaysShortRaw: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];