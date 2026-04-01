<!-- ToDo.svelte -->

<script lang="ts">
	import {todos} from '$lib/todos.svelte';
	import {settings} from "$lib/settings";
	import {Check, X} from "@lucide/svelte";

	let {todo} = $props();

	/**
	 * Convert raw todo text into HTML suitable for display in the component.
	 *
	 * This helper applies two formatting rules:
	 * 1. Detects plain URL strings and wraps them in anchor tags.
	 * 2. Replaces newline characters with `<br>` tags so line breaks are preserved.
	 *
	 * The generated links deliberately prevent the browser's default navigation
	 * behavior on click to force the use of middle mouse click.
	 *
	 * @param title Raw todo title text entered by the user.
	 * @returns Formatted HTML string with clickable-looking links and preserved line breaks.
	 */
	const formatText = (title: string): string => {
		// Auto link
		title = title.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/g, function() {
			return '<a class="cursor-text" href="'+arguments[0]+'" onclick="event.preventDefault()">'+arguments[0]+'</a>'
		});

		// Break lines
		title = title.replace(/\n/g, '<br>');

		return title;
	}

	/**
	 * Automatically resize a textarea-like element to match its content height.
	 *
	 * The function first shrinks the element height to a small value so the browser
	 * recalculates its scroll height correctly, then expands it to fit the full
	 * content without scrollbars.
	 *
	 * @param e DOM event whose target is the resizable input element.
	 */
	const autoGrow = (e: any) => {
		e.target.style.height = "5px";
		e.target.style.height = (e.target.scrollHeight) + "px";
	}

	/**
	 * Svelte action-like helper that focuses an element as soon as it is available.
	 * Used to focus textarea in edit mode.
	 *
	 * @param node HTML element that should receive focus.
	 */
	const focusElement = (node: HTMLElement) =>{
		node.focus();
	};
</script>

<div class="group w-[100%] p-1 py-2 relative text-left rounded my-1 mb-2 bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950 {todos.isEditCurrent(todo) ? 'bg-neutral-300 dark:bg-neutral-950' : ''} {!$settings.showDone && todo.done ? 'hidden' : ''}" draggable="true" title="Drag to move">
	{#if todos.isEditCurrent(todo)}
		<textarea id="todo-{todo.id}" use:focusElement class="block resize-none w-[calc(100%-60px)] min-h-4 h-[24px] ml-[10px] mr-[50px] outline-0" oninput={autoGrow} onfocusin={autoGrow} onfocusout={() => todos.edit(null)} onchange={(e) => todos.update(todo, e.target.value)}>{todo.title}</textarea>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
		<div class="w-[calc(100%-60px)] min-h-6 ml-[10px] mr-[50px] break-words cursor-text {todo.done ? 'line-through' : ''}" onclick={() => todos.edit(todo)}>{@html formatText(todo.title)}</div>
	{/if}
	<button class="absolute top-2 right-1 cursor-pointer hidden group-hover:block" title="Delete" onclick={() => todos.delete(todo)}><X size={20} /></button>
	<button class="absolute top-2 right-7 cursor-pointer hidden group-hover:block" title="Done" onclick={() => todos.done(todo, !todo.done)}><Check size={22} /></button>
</div>