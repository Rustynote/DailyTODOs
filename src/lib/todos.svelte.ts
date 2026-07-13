import {formatDate} from '$lib/date';

/**
 * Key used to store todo items in the browser's localStorage.
 *
 * The stored value is expected to be a JSON-serialized array of todo items.
 */
const LS_KEY = 'todos';

/**
 * Represents a single todo entry.
 *
 * @property id Unique identifier of the todo item.
 * @property title User-provided text describing the task.
 * @property date Formatted date string used to associate the task with a day.
 * @property done Indicates whether the task has been completed.
 */
type item = {
    id: string;
    title: string;
    date: string,
    done: boolean
};

/**
 * Reactive in-memory list of todo items, initialized from localStorage on startup.
 */
let items: item[] = $state([]);

/**
 * Restore saved todo items from localStorage.
 *
 * If the stored value exists and is valid JSON, it is parsed and used as the
 * initial todo list. If loading fails, the application keeps an empty array
 * and logs the error for debugging purposes.
 */
try {
    const rawItems = localStorage.getItem(LS_KEY);
    if(rawItems) {
        items = JSON.parse(rawItems);
    }
} catch(e) {
    console.error('Failed to load items', e)
}

/**
 * Holds the currently edited todo item.
 *
 * The value is either:
 * - a todo item currently being edited
 * - `null` when no item is in edit mode
 */
let editing: item | null = $state(null);

/**
 * Persist the current todo list to localStorage.
 *
 * Called after every mutation so todos survive page reloads and browser restarts.
 */
function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
}

/**
 * Collection of helper methods for creating, updating, querying, and managing
 * todo items.
 */
export const todos = {
    /**
     * Create a new empty todo item for the given date.
     *
     * A new item is initialized with:
     * - a generated UUID
     * - an empty title
     * - the formatted date string
     * - `done` set to `false`
     *
     * After creation, the item is added to the internal array, persisted to
     * localStorage, and set as the currently edited item.
     *
     * @param d Date object representing the day the todo belongs to.
     */
    add: (d: Date) => {
        const id = crypto.randomUUID();
        const date = formatDate(d);

        const todo: item = {
            id: id,
            title: '',
            date: date,
            done: false
        };

        items.push(todo);
        persist();

        editing = todo;
    },

    /**
     * Update the title of an existing todo item.
     *
     * The target item is identified by its `id`. A new array is created where
     * only the matching item receives the updated title.
     *
     * After the update, the change is persisted to localStorage.
     *
     * @param item Todo item that should be updated.
     * @param title New title value for the todo item.
     */
    update: (item: item, title: string) => {
        items = items.map((e) => (e.id === item.id ? {...e, title: title} : e));

        persist();
    },

    /**
     * Remove a todo item from the collection.
     *
     * The item is matched by `id` and excluded from the new array. The updated
     * list is then persisted to localStorage.
     *
     * @param item Todo item to remove.
     */
    delete: (item: item) => {
        items = items.filter((e) => e.id !== item.id);

        persist();
    },

    /**
     * Update the completion state of a todo item.
     *
     * By default, this method marks the item as done. Passing `false` allows
     * the same method to mark the item as not completed.
     *
     * After the update, the change is persisted to localStorage.
     *
     * @param item Todo item whose completion state should be changed.
     * @param done Whether the item should be marked as completed. Defaults to `true`.
     */
    done: (item: item, done: boolean = true) => {
        items = items.map((e) => (e.id === item.id ? {...e, done: done} : e));

        persist();
    },

    /**
     * Return all todo items assigned to a specific day.
     *
     * The provided `Date` is formatted using the same helper used when storing
     * todos, ensuring consistent day matching.
     *
     * @param d Date object representing the day to search for.
     * @returns Array of todo items scheduled for the given day.
     */
    onDay: (d: Date) => {
        const dateStr = formatDate(d);

        return items.filter((e) => e.date === dateStr);
    },

    /**
     * Set or clear the currently edited todo item.
     *
     * Pass a todo item to enable edit mode for that item, or pass `null` to
     * leave edit mode.
     *
     * @param item Todo item to edit, or `null` to clear edit mode.
     */
    edit: (item: item | null) => {
        editing = item;
    },

    /**
     * Determine whether the provided todo item is the one currently in edit mode.
     *
     * The function returns `true` only when:
     * - the provided item is not `null`
     * - there is an active item being edited
     * - both items share the same `id`
     *
     * @param item Todo item to compare against the currently edited item.
     * @returns `true` when the given item is the active edited item, otherwise `false`.
     */
    isEditCurrent: (item: item | null) => {
        return item !== null && editing !== null && editing.id === item.id;
    }
}