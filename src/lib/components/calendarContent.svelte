<!-- calendarContent.svelte -->

<script lang="ts">
	import {settings} from "$lib/settings";
	import {currentDate, selectedDate, today, weekStartDayIndex} from "$lib/vars";
	import {startOfWeek, endOfWeek, startOfMonthGrid, endOfMonthGrid, daysInWeek, rangeDays, weekDayLabels} from "$lib/calendar.svelte";
	import {formatDate} from "$lib/date";
	import {todos} from "$lib/todos.svelte";
	import {dropColumn, dropGhost, dragPreview, draggingTodo, startDragMonitor} from "$lib/dnd";
	import ToDo from "./ToDo.svelte";

	// Number of columns in the grid: 5 when weekends are hidden, otherwise 7.
	let diw = $derived(daysInWeek($settings.hideWeekend));

	// Day index (0=Sunday ... 6=Saturday) the week starts on, per settings.
	let weekStartDay = $derived(weekStartDayIndex[$settings.weekStart] ?? 1);

	// Weekday header labels, starting at weekStartDay and trimmed to weekdays
	// only when weekends are hidden.
	let weekDaysShort = $derived(weekDayLabels(weekStartDay, $settings.hideWeekend));

	let monthDays: Date[] = $state([]);
	let monthRows: number = $state(0);
	let weekStart: Date = $state(today);
	let weekEnd: Date = $state(today);
	let weekDays: Date[] = $state([]);

	// Recompute the full set of days shown in the month grid whenever the
	// displayed month, view, weekend visibility, or week-start day changes.
	$effect(() => {
		monthDays = rangeDays(startOfMonthGrid($currentDate, weekStartDay), endOfMonthGrid($currentDate, weekStartDay), $currentDate, $settings.view, $settings.hideWeekend, weekStartDay);
	});
	// Derive the number of grid rows needed to fit all month days, used to
	// size the CSS grid via the `--month-rows` custom property.
	$effect(() => {
		monthRows = Math.floor(monthDays.length / diw);
	});
	// Recompute the visible week's start day whenever the selected day or
	// week-start day changes.
	$effect(() => {
		weekStart = startOfWeek($selectedDate, weekStartDay);
	});
	// Recompute the visible week's end day whenever the selected day or
	// week-start day changes.
	$effect(() => {
		weekEnd = endOfWeek($selectedDate, weekStartDay);
	});
	// Recompute the full set of days shown in the week grid whenever its
	// range, view, weekend visibility, or week-start day changes.
	$effect(() => {
		weekDays = rangeDays(weekStart, weekEnd, $currentDate, $settings.view, $settings.hideWeekend, weekStartDay);
	});

	// Single drop monitor for the whole calendar: resolves every todo drag
	// (started via `dragCard`) against the innermost drop target it landed
	// on and applies the move once dropped. See `$lib/dnd` for the details.
	$effect(() => {
		return startDragMonitor();
	});

	/**
	 * Whether the drop preview line for the currently dragged todo item
	 * belongs right before/after a given spot.
	 *
	 * @param date Date of the day cell being rendered.
	 * @param targetId Todo item to position against, or `null` for "end of day".
	 * @param position Whether checking the slot before or after `targetId`.
	 */
	function previewAt(date: string, targetId: string | null, position: 'before' | 'after') {
		return $dragPreview !== null && $dragPreview.date === date && $dragPreview.targetId === targetId && $dragPreview.position === position;
	}

	/**
	 * Whether a todo's edit textarea was focused right before the current
	 * container click. Captured on `mousedown`, since focus already moves
	 * away from the textarea (triggering its blur/save) before `click` fires,
	 * so by the time `onContainerClick` runs it's too late to tell.
	 */
	let wasEditingBeforeClick = false;

	/**
	 * Record whether a todo was mid-edit before this click shifts focus away
	 * from it.
	 *
	 * @param e Mousedown event from the todo-list container.
	 */
	function onContainerMouseDown(e: MouseEvent) {
		wasEditingBeforeClick = document.activeElement instanceof HTMLTextAreaElement && document.activeElement.id.startsWith('todo-');
	}

	/**
	 * Add a new todo for `d` when the day's todo-list container is clicked
	 * directly, rather than via a bubbled click from a child element (an
	 * existing todo, a link, etc). If a todo was being edited, the click
	 * instead just unfocuses it (its own blur handler already saves and
	 * exits edit mode) rather than also creating a new item.
	 *
	 * @param e Click event from the todo-list container.
	 * @param d Date of the day being clicked.
	 */
	function onContainerClick(e: MouseEvent, d: Date) {
		if(e.target !== e.currentTarget) return;
		if(wasEditingBeforeClick) return;

		todos.add(d);
	}
</script>

{#snippet dropIndicator()}
	<div class="w-[100%] p-1 py-2 relative text-left rounded my-1 mb-2 outline-2 outline-dashed outline-blue-400 dark:outline-blue-500 bg-neutral-200/60 dark:bg-neutral-900/60 select-none" use:dropGhost={$dragPreview}>
		<div class="w-[calc(100%-60px)] min-h-6 ml-[10px] mr-[50px] break-words">
			{$draggingTodo?.title}
		</div>
	</div>
{/snippet}

{#snippet weekdayHeader()}
	<div class="flex text-center shrink-0 select-none uppercase">
		{#each weekDaysShort as weekDayShort}
			<div class="cursor-default border-b {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-x border-neutral-200 dark:border-neutral-900 py-1">{weekDayShort}</div>
		{/each}
	</div>
{/snippet}

{#snippet dayColumn(d: Date, padTop: boolean)}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
	<div class="flex flex-col {padTop ? 'pt-2 ' : ''}px-2 h-[100%] min-h-0 overflow-y-auto cursor-pointer" use:dropColumn={formatDate(d)} onmousedown={onContainerMouseDown} onclick={(e) => onContainerClick(e, d)}>
		{#each todos.onDay(d) as todo (todo.id)}
			{#if previewAt(formatDate(d), todo.id, 'before')}
				{@render dropIndicator()}
			{/if}
			<ToDo todo={todo}/>
			{#if previewAt(formatDate(d), todo.id, 'after')}
				{@render dropIndicator()}
			{/if}
		{/each}
		{#if previewAt(formatDate(d), null, 'after')}
			{@render dropIndicator()}
		{/if}
	</div>
{/snippet}

{#snippet addTodoButton(d: Date)}
	<button class="flex items-center justify-center absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-950 select-none" onclick={() => todos.add(d)} title="Add todo" aria-label="Add todo">
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"></line><line x1="4" y1="12" x2="20" y2="12"></line></svg>
	</button>
{/snippet}

<div class="calendar flex flex-col flex-1 min-h-0 bg-white dark:bg-neutral-800 text-sm">
	{#if $settings.view === 'month'}
		{@render weekdayHeader()}
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-900 text-center flex-1 min-h-0 grid-rows-[repeat(var(--month-rows),1fr)]" style="--month-rows: {monthRows}">
			{#each monthDays as d}
				{#key formatDate(d)}
					<div class="pb-[35px] relative flex flex-col min-h-0 {d.getMonth()!==$currentDate.getMonth() && 'bg-neutral-300 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-900">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-900 {$selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-900': ''} select-none" onclick={() => $selectedDate = d}>{d.getDate()}</button>
						{@render dayColumn(d, false)}
						{@render addTodoButton(d)}
					</div>
				{/key}
			{/each}
		</div>
	{:else if $settings.view === 'week'}
		{@render weekdayHeader()}
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-800 text-center flex-1 min-h-0 grid-rows-1">
			{#each weekDays as d}
				{#key formatDate(d)}
					<div class="pb-[35px] relative flex flex-col min-h-0 border border-neutral-200 dark:border-neutral-900">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-950 {$selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-950': ''} select-none" onclick={() => $selectedDate = d}>{d.getDate()}</button>
						{@render dayColumn(d, true)}
						{@render addTodoButton(d)}
					</div>
				{/key}
			{/each}
		</div>
	{:else}
		<div class="day flex-1 min-h-0">
			<div class="h-full pb-[35px] relative flex flex-col border border-neutral-200 dark:border-neutral-800">
				{@render dayColumn($selectedDate, true)}
				{@render addTodoButton($selectedDate)}
			</div>
		</div>
	{/if}
</div>
