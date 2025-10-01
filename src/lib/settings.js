import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultSettings = {
    hideWeekend: true,
    showDone: true,
    view: 'month',
    isDark: window.matchMedia("(prefers-color-scheme: dark)").matches
};
let initSettings = defaultSettings;
if(browser) { // Ensure localStorage is accessed only in the browser
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
        try {
            initSettings = JSON.parse(storedSettings);
            if(typeof initSettings === 'object') {
                for(let key in defaultSettings) {
                    // @ts-ignore
                    if(defaultSettings.hasOwnProperty(key) && typeof initSettings[key] === 'undefined') {
                        // @ts-ignore
                        initSettings[key] = defaultSettings[key];
                    }
                }
            }
        } catch (e) {
            initSettings = defaultSettings;
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