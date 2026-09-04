<!-- ToDo.svelte -->

<script lang="ts">
    import {todos} from '$lib/todos.svelte';
    import {settings} from "$lib/settings";
    import {dragCard, dropCard} from "$lib/dnd";

    /**
     * Todo item passed into the component through Svelte props.
     *
     * This component is responsible for rendering a single todo entry,
     * including its display mode, edit mode, completion state, and actions.
     */
    let {todo} = $props();

    /**
     * Controls whether the todo text can be switched into inline edit mode.
     *
     * This is set to `false` when the formatted content contains embedded images,
     * because clicking the item should then behave like interacting with media
     * rather than placing the item into text editing mode.
     *
     * Note that this flag is derived during formatting, so it depends on the
     * current contents of the todo title.
     */
    let isEditable = $state(true);
    /**
     * Convert raw todo text into HTML suitable for display in the component.
     *
     * This helper applies two formatting rules:
     * 1. Detects plain URL strings in the title.
     * 2. If a URL points to an image file, it is rendered as an embedded image
     *    wrapped in a link that opens the image in a new tab.
     * 3. If a URL is not an image, it is converted into an anchor element.
     * 4. Replaces newline characters with `<br>` tags so line breaks are preserved.
     *
     * When an image URL is detected, inline editing is disabled by setting
     * `isEditable` to `false`. This prevents accidental edit activation when
     * the user is trying to interact with the rendered media.
     *
     * Non-image links intentionally prevent the browser's default click behavior,
     * which suggests the UI expects users to open them via middle click or other
     * manual interaction instead of normal left-click navigation.
     *
     * @param title Raw todo title text entered by the user.
     * @returns HTML string with links, optional image embeds, and preserved line breaks.
     */
    const formatText = (title: string) => {
        // Auto link and embeding the image
        const urls = title.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/g);
        if(Array.isArray(urls)) {
            for(const url of urls) {
                const isImage = url.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i);
                if(isImage) {
                    // Disable edit because there's a image
                    isEditable = false;

                    title = title.replace(url, '<a href="' + url + '" target="_blank"><img src="' + url + '" alt=""></a>');
                } else {
                    title = title.replace(url, '<a class="cursor-text" href="' + url + '" onclick="event.preventDefault()">' + url + '</a>');
                }
            }
        }

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
    const focusElement = (node: HTMLElement) => {
        node.focus();
    };

    /**
     * Exit edit mode when the textarea loses focus, discarding the todo
     * entirely if its title was left blank rather than persisting an
     * empty item.
     *
     * @param e Focusout event from the edit textarea.
     */
    const onEditBlur = (e: FocusEvent & {currentTarget: HTMLTextAreaElement}) => {
        todos.edit(null);

        if(e.currentTarget.value.trim() === '') {
            todos.delete(todo);
        }
    };
</script>

<!--
    Root wrapper for a single todo item.

    Visual state is controlled by several conditions:
    - highlights the item when it is currently being edited
    - hides completed items when the relevant setting is disabled
    - applies strike-through and reduced opacity when the item is marked done
-->
<div class="group w-[100%] relative text-left rounded my-1 mb-2 {todos.isEditCurrent(todo) ? '' : ''} {!$settings.showDone && todo.done ? 'hidden' : ''}" use:dragCard={todo} use:dropCard={todo} title="Drag to move">
	<button class="absolute left-1 top-2 cursor-pointer flex items-center justify-center w-5 h-5 rounded-full border-2 border-neutral-400 dark:border-neutral-600 hover:border-neutral-600 dark:hover:border-neutral-300" title="Done" aria-label="Done" onclick={() => todos.done(todo, !todo.done)}>
		{#if todo.done}
			<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="4 12 9 18 20 6"></polyline>
			</svg>
		{/if}
	</button>
	{#if todos.isEditCurrent(todo)}
		<textarea id="todo-{todo.id}" use:focusElement class="block resize-none w-[calc(100%-60px)] min-h-4 h-[24px] ml-[34px] mr-[28px] p-2 outline-0 bg-neutral-200 dark:bg-neutral-950" oninput={autoGrow} onfocusin={autoGrow} onfocusout={onEditBlur} onchange={(e: Event & { currentTarget: HTMLTextAreaElement }) => todos.update(todo, e.currentTarget.value)}>{todo.title}</textarea>
	{:else}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
		<div class="w-[calc(100%-60px)] min-h-6 ml-[34px] mr-[28px] break-words {isEditable ? 'cursor-text' : 'cursor-pointer'} p-2 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-950{todo.done ? ' line-through opacity-70' : ''}" onclick={() => isEditable && todos.edit(todo)}>
			{@html formatText(todo.title)}
		</div>
	{/if}
	<button class="icon-btn-muted absolute top-2 right-1" title="Delete" aria-label="Delete" onclick={() => todos.delete(todo)}>
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
			<line x1="5" y1="5" x2="19" y2="19"></line>
			<line x1="19" y1="5" x2="5" y2="19"></line>
		</svg>
	</button>
</div>