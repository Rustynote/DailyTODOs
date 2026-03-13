import { writable } from 'svelte/store';
import { fmtDate } from '$lib/date';

const LS_KEY = 'todos1';

type item = { id: string; title: string; date: string, done: boolean };
let items: item[] = $state([]);

try {
    const rawItems = localStorage.getItem(LS_KEY);
    if(rawItems) {
        items = JSON.parse(rawItems);
    }
} catch (e) {
    console.error('Failed to load items', e)
}

let editing: item|false = $state(false);

export const todoItems = writable(items);
export const edit = writable(editing);

todoItems.subscribe(value => {
    localStorage.setItem(LS_KEY, JSON.stringify(value));
});

/**
 * Todo functions
 */
export const todo = {
    /**
     * Add new todo
     *
     * @param d Date object
     */
    add: (d: Date) => {
        const id = crypto.randomUUID();
        const date = fmtDate(d);

        const todo: item = {
            id: id,
            title: '',
            date: date,
            done: false
        };

        items.push(todo);
        todoItems.set(items);

        editing = todo;
    },
    /**
     * Update todo title
     *
     * @param item todo object
     * @param title New title
     */
    update: (item: item, title: string) => {
        items = items.map((e) => (e.id === item.id ? { ...e, title: title } : e));

        todoItems.set(items);
    },
    /**
     * Delete todo item
     *
     * @param item todo object
     */
    delete: (item: item) => {
        items = items.filter((e) => e.id !== item.id);

        todoItems.set(items);
    },
    /**
     * Mark the item as done
     *
     * @param item todo object
     * @param done If it's done or not
     */
    done: (item: item, done: boolean = true) => {
        items = items.map((e) => (e.id === item.id ? { ...e, done: done } : e));

        todoItems.set(items);
    },
    /**
     * Get all todos for specific date
     *
     * @param d Date object
     */
    onDay: (d: Date) => {
        const dateStr = fmtDate(d);

        return items.filter((e) => e.date === dateStr);
    },
    /**
     * Edit an item
     * @param item
     */
    edit: (item: item|false) => {
        // @ts-ignore
        edit.set(item);
    }
}