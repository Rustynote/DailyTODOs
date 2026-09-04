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
export type item = {
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
 * Type guard verifying that a value has the shape of a todo item.
 *
 * Used to validate data coming from an imported file before trusting it,
 * since it's arbitrary user-supplied JSON rather than our own storage.
 *
 * @param value Value to check.
 * @returns `true` when `value` has all the fields of an `item` with the expected types.
 */
function isItem(value: unknown): value is item {
    if(typeof value !== 'object' || value === null) return false;

    const candidate = value as Partial<item>;

    return typeof candidate.id === 'string'
        && typeof candidate.title === 'string'
        && typeof candidate.date === 'string'
        && typeof candidate.done === 'boolean';
}

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
 * Keep this tab's todo list in sync with changes made in other tabs.
 *
 * The `storage` event only fires on tabs other than the one that made the
 * change, so this doesn't loop back on our own `persist()` writes below.
 * `key` is `null` when another tab calls `localStorage.clear()` (see the
 * "Remove Data" setting), in which case we fall back to an empty list.
 */
window.addEventListener('storage', (e) => {
    if(e.key !== null && e.key !== LS_KEY) return;

    try {
        items = e.newValue ? JSON.parse(e.newValue) : [];
    } catch(err) {
        console.error('Failed to sync items from another tab', err);
    }
});

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
    },

    /**
     * Move a todo item, used to implement drag-and-drop.
     *
     * The item is removed from its current position and reinserted either
     * relative to `targetId`, or at the end of the list when `targetId` is
     * `null` (e.g. dropping into empty space within a day). Its `date` is
     * updated to `date`, so this also handles moving an item to a different day.
     *
     * @param id Id of the todo item being moved.
     * @param date Date the item should belong to after the move.
     * @param targetId Id of the todo item to position against, or `null` to append to the end.
     * @param position Whether to insert before or after `targetId`. Ignored when `targetId` is `null`.
     */
    move: (id: string, date: string, targetId: string | null, position: 'before' | 'after') => {
        if(id === targetId) return;

        const dragged = items.find((e) => e.id === id);
        if(!dragged) return;

        const rest = items.filter((e) => e.id !== id);
        const moved = {...dragged, date};

        const targetIndex = targetId === null ? -1 : rest.findIndex((e) => e.id === targetId);
        if(targetIndex === -1) {
            items = [...rest, moved];
        } else {
            const insertAt = position === 'before' ? targetIndex : targetIndex + 1;

            items = [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)];
        }

        persist();
    },

    /**
     * Return a snapshot of all todo items, in their current stored order.
     *
     * Used to build a portable export of the user's data.
     *
     * @returns Array of all todo items.
     */
    export: () => items,

    /**
     * Replace the entire todo list with the given data.
     *
     * Used to restore a previously exported backup. `data` is validated
     * before being accepted; existing todos are discarded entirely on success.
     *
     * @param data Parsed JSON to import, expected to be an array of todo items.
     * @returns `true` when `data` was a valid array of todo items and the import succeeded, `false` otherwise.
     */
    import: (data: unknown): boolean => {
        if(!Array.isArray(data) || !data.every(isItem)) {
            return false;
        }

        items = data;
        persist();

        return true;
    },

    /**
     * Remove all todo items and clear their persisted storage.
     *
     * Unlike `delete`, this clears the whole list at once and is used by the
     * "Remove Data" setting so the UI updates immediately, without requiring
     * a page reload.
     */
    clear: () => {
        items = [];
        localStorage.removeItem(LS_KEY);
    }
}