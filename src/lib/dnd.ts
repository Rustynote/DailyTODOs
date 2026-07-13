import {draggable, dropTargetForElements, monitorForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {disableNativeDragPreview} from '@atlaskit/pragmatic-drag-and-drop/element/disable-native-drag-preview';
import type {DragLocationHistory} from '@atlaskit/pragmatic-drag-and-drop/types';
import {writable} from 'svelte/store';
import {todos, type item} from '$lib/todos.svelte';

/**
 * CSS classes applied to a todo item's own element while it is being
 * dragged, hiding it in place. The browser has already captured the drag
 * image by the time `onDragStart` runs, so hiding the source here doesn't
 * affect it. `calendarContent.svelte` renders a stand-in preview card at
 * the spot it would land instead (see `draggingTodo`/`dropIndicator`).
 */
const DRAGGING_CLASSES = ['hidden'];

/**
 * Where a dragged todo item would land if dropped right now.
 *
 * `targetId` is the todo item being positioned against, or `null` when
 * dropping into empty space (append to the end of `date`). `null` overall
 * means nothing is currently being dragged over a valid target.
 */
export type DropPreview = {
    date: string;
    targetId: string | null;
    position: 'before' | 'after';
} | null;

/**
 * Reactive store tracking where a todo item currently being dragged would
 * land. Consumed by `calendarContent.svelte` to render a placeholder card
 * at that spot.
 */
export const dragPreview = writable<DropPreview>(null);

/**
 * Reactive store holding the todo item currently being dragged, or `null`
 * when nothing is being dragged. Used to render the placeholder preview
 * card (see `dragPreview`) with the same title as the item being moved.
 */
export const draggingTodo = writable<item | null>(null);

/**
 * Svelte action that makes a todo item's root element draggable.
 *
 * Attaches the item's `id` as the drag payload so drop targets (see
 * `dropCard`/`dropColumn`) and the drop monitor can identify which todo is
 * being moved. Hides the item at its origin for the duration of the drag
 * (see `DRAGGING_CLASSES`) and publishes it via `draggingTodo`. Suppresses
 * the browser's default drag preview image, since the placeholder card
 * rendered at the drop position already shows what's being moved.
 *
 * @param node Root element of the todo item.
 * @param todo Todo item rendered by that element.
 */
export function dragCard(node: HTMLElement, todo: item) {
    let current = todo;

    const cleanup = draggable({
        element: node,
        getInitialData: () => ({todoId: current.id}),
        onGenerateDragPreview: disableNativeDragPreview,
        onDragStart: () => {
            node.classList.add(...DRAGGING_CLASSES);
            draggingTodo.set(current);
        },
        onDrop: () => {
            node.classList.remove(...DRAGGING_CLASSES);
            draggingTodo.set(null);
        }
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
 * or after this item (the exact edge is resolved by `startDragMonitor`).
 * The item's own `id`/`date` are exposed as data so the monitor knows
 * where the drop landed.
 *
 * @param node Root element of the todo item.
 * @param todo Todo item rendered by that element.
 */
export function dropCard(node: HTMLElement, todo: item) {
    let current = todo;

    const cleanup = dropTargetForElements({
        element: node,
        getData: () => ({type: 'card', todoId: current.id, date: current.date}),
        canDrop: ({source}) => source.data.todoId !== current.id
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

/**
 * Svelte action that turns the drop-preview placeholder card into a drop
 * target reporting its own current position.
 *
 * Without this, the placeholder sits where a real card used to be, so
 * hovering it falls through to the day's `dropColumn`, which resolves to
 * "append at the end". That moves the placeholder away, which lets the
 * pointer land back on a real card, moving the placeholder back... an
 * infinite loop that looks like the items rapidly reordering themselves.
 * Making the placeholder report back the same position it already
 * represents turns hovering it into a no-op, breaking that loop.
 *
 * @param node Root element of the placeholder card.
 * @param preview The position this placeholder currently represents.
 */
export function dropGhost(node: HTMLElement, preview: DropPreview) {
    let current = preview;

    const cleanup = dropTargetForElements({
        element: node,
        getData: () => ({type: 'ghost', preview: current})
    });

    return {
        update(next: DropPreview) {
            current = next;
        },
        destroy: cleanup
    };
}

/**
 * Resolve a drag location into a concrete drop position: which day, which
 * item to position against (or `null` for "append to end"), and whether to
 * insert before or after it.
 *
 * The edge (before/after) is derived from the pointer's Y position relative
 * to the vertical midpoint of the hovered card.
 *
 * @param location Current drag location, as provided by the drop monitor.
 * @returns The resolved drop position, or `null` if nothing valid is being hovered.
 */
function resolveDrop(location: DragLocationHistory): DropPreview {
    const target = location.current.dropTargets[0];
    if(!target) return null;

    if(target.data.type === 'ghost') {
        return target.data.preview as DropPreview;
    }

    if(target.data.type === 'card') {
        const rect = target.element.getBoundingClientRect();
        const isAfter = location.current.input.clientY > rect.top + rect.height / 2;

        return {date: target.data.date as string, targetId: target.data.todoId as string, position: isAfter ? 'after' : 'before'};
    }

    if(target.data.type === 'column') {
        return {date: target.data.date as string, targetId: null, position: 'after'};
    }

    return null;
}

/**
 * Start listening for todo item drags across the whole calendar.
 *
 * While a drag is in progress, keeps `dragPreview` in sync with where a
 * drop would currently land. Once the drag ends, applies the move via
 * `todos.move()` and clears the preview.
 *
 * @returns Cleanup function that stops the monitor.
 */
export function startDragMonitor() {
    return monitorForElements({
        onDropTargetChange({location}) {
            dragPreview.set(resolveDrop(location));
        },
        onDrag({location}) {
            dragPreview.set(resolveDrop(location));
        },
        onDrop({source, location}) {
            const drop = resolveDrop(location);

            dragPreview.set(null);

            if(drop) {
                todos.move(source.data.todoId as string, drop.date, drop.targetId, drop.position);
            }
        }
    });
}
