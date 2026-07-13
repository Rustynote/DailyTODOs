import {draggable, dropTargetForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type {item} from '$lib/todos.svelte';

/**
 * CSS classes applied to a todo item while it is being dragged.
 */
const DRAGGING_CLASSES = ['opacity-40'];

/**
 * CSS classes applied to a drop target while a todo item is being dragged over it.
 */
const DRAG_OVER_CLASSES = ['outline-2', 'outline-blue-500'];

/**
 * Svelte action that makes a todo item's root element draggable.
 *
 * Attaches the item's `id` as the drag payload so drop targets (see
 * `dropCard`/`dropColumn`) and the drop monitor can identify which todo is
 * being moved.
 *
 * @param node Root element of the todo item.
 * @param todo Todo item rendered by that element.
 */
export function dragCard(node: HTMLElement, todo: item) {
    let current = todo;

    const cleanup = draggable({
        element: node,
        getInitialData: () => ({todoId: current.id}),
        onDragStart: () => node.classList.add(...DRAGGING_CLASSES),
        onDrop: () => node.classList.remove(...DRAGGING_CLASSES)
    });

    return {
        update(next: item) {
            current = next;
        },
        destroy: cleanup
    };
}

/**
 * Svelte action that turns a todo item's root element into a drop target.
 *
 * Dropping another todo item onto this one reorders it immediately before
 * or after this item (the exact edge is resolved by the drop monitor, see
 * `calendarContent.svelte`). The item's own `id`/`date` are exposed as data
 * so the monitor knows where the drop landed.
 *
 * @param node Root element of the todo item.
 * @param todo Todo item rendered by that element.
 */
export function dropCard(node: HTMLElement, todo: item) {
    let current = todo;

    const cleanup = dropTargetForElements({
        element: node,
        getData: () => ({type: 'card', todoId: current.id, date: current.date}),
        canDrop: ({source}) => source.data.todoId !== current.id,
        onDragEnter: () => node.classList.add(...DRAG_OVER_CLASSES),
        onDragLeave: () => node.classList.remove(...DRAG_OVER_CLASSES),
        onDrop: () => node.classList.remove(...DRAG_OVER_CLASSES)
    });

    return {
        update(next: item) {
            current = next;
        },
        destroy: cleanup
    };
}

/**
 * Svelte action that turns a day's todo list container into a drop target.
 *
 * Handles drops that don't land on a specific todo item (an empty day, or
 * empty space below the last item), appending the dragged item to the end
 * of that day.
 *
 * @param node Element wrapping a day's todo items.
 * @param date Date string of the day that element represents.
 */
export function dropColumn(node: HTMLElement, date: string) {
    let current = date;

    const cleanup = dropTargetForElements({
        element: node,
        getData: () => ({type: 'column', date: current})
    });

    return {
        update(next: string) {
            current = next;
        },
        destroy: cleanup
    };
}
