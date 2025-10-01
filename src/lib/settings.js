import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultSettings = {
    hideWeekend: true,
    showDone: true,
    view: 'month'
};
let initSettings = defaultSettings;
if(browser) { // Ensure localStorage is accessed only in the browser
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
        try {
            initSettings = JSON.parse(storedSettings);
        } catch (e) {
            console.error("Error parsing stored settings:", e);
        }
    }
}

export const settings = writable(initSettings);

if(browser) {
    settings.subscribe(value => {
        localStorage.setItem('settings', JSON.stringify(value));
    });
}