<!-- calendarContent.svelte -->

<script lang="ts">
	import {settings} from "$lib/settings";
	import {currentDate, selectedDate, weekDaysShortRaw, today} from "$lib/vars";
	import {startOfWeek, endOfWeek, startOfMonthGrid, endOfMonthGrid, daysInWeek, rangeDays} from "$lib/calendar.svelte";
	import {formatDate} from "$lib/date";
	import {todos} from "$lib/todos.svelte";
	import {dropColumn, dropGhost, dragPreview, draggingTodo, startDragMonitor} from "$lib/dnd";
	import ToDo from "./ToDo.svelte";

	// Number of columns in the grid: 5 when weekends are hidden, otherwise 7.
	let diw = $derived(daysInWeek($settings.hideWeekend));

	// Weekday header labels, trimmed to weekdays only when weekends are hidden.
	let weekDaysShort = $derived($settings.hideWeekend ? weekDaysShortRaw.slice(0, 5) : weekDaysShortRaw);

	let monthDays: Date[] = $state([]);
	let monthRows: number = $state(0);
	let weekStart: Date = $state(today);
	let weekEnd: Date = $state(today);
	let weekDays: Date[] = $state([]);

	// Recompute the full set of days shown in the month grid whenever the
	// displayed month, view, or weekend visibility changes.
	$effect(() => {
		monthDays = rangeDays(startOfMonthGrid($currentDate), endOfMonthGrid($currentDate), $currentDate, $settings.view, $settings.hideWeekend);
	});
	// Derive the number of grid rows needed to fit all month days, used to
	// size the CSS grid via the `--month-rows` custom property.
	$effect(() => {
		monthRows = Math.floor(monthDays.length / diw);
	});
	// Recompute the visible week's start day whenever the selected day changes.
	$effect(() => {
		weekStart = startOfWeek($selectedDate);
	});
	// Recompute the visible week's end day whenever the selected day or
	// weekend visibility changes.
	$effect(() => {
		weekEnd = endOfWeek($selectedDate, $settings.hideWeekend);
	});
	// Recompute the full set of days shown in the week grid whenever its
	// range, view, or weekend visibility changes.
	$effect(() => {
		weekDays = rangeDays(weekStart, weekEnd, $currentDate, $settings.view, $settings.hideWeekend);
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
</script>

{#snippet dropIndicator()}
	<div class="w-[100%] p-1 py-2 relative text-left rounded my-1 mb-2 outline-2 outline-dashed outline-blue-400 dark:outline-blue-500 bg-neutral-200/60 dark:bg-neutral-900/60 select-none" use:dropGhost={$dragPreview}>
		<div class="w-[calc(100%-60px)] min-h-6 ml-[10px] mr-[50px] break-words">
			{$draggingTodo?.title}
		</div>
	</div>
{/snippet}

<div class="calendar flex flex-col flex-1 min-h-0">
	{#if $settings.view === 'month'}
		<div class="flex text-center shrink-0 select-none">
			{#each weekDaysShort as weekDayShort}
				<div class="cursor-default border-b {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-x border-neutral-200 dark:border-neutral-900">{weekDayShort}</div>
			{/each}
		</div>
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-900 text-center flex-1 min-h-0 grid-rows-[repeat(var(--month-rows),1fr)]" style="--month-rows: {monthRows}">
			{#each monthDays as d}
				{#key formatDate(d)}
					<div class="pb-[35px] relative flex flex-col {d.getMonth()!==$currentDate.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-900">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-900 {$selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-900': ''} select-none" onclick={() => $selectedDate = d}>{d.getDate()}</button>
						<div class="flex flex-col px-2 h-[100%] overflow-y-auto" use:dropColumn={formatDate(d)}>
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
						<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950 select-none" onclick={
							() => {
                                todos.add(d)
							}}>
							+
						</button>
					</div>
				{/key}
			{/each}
		</div>
	{:else if $settings.view === 'week'}
		<div class="flex text-center shrink-0 select-none">
			{#each weekDaysShort as weekDayShort}
				<div class="cursor-default border-b {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-x border-neutral-200 dark:border-neutral-900">{weekDayShort}</div>
			{/each}
		</div>
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-800 text-center flex-1 min-h-0 grid-rows-1">
			{#each weekDays as d}
				{#key formatDate(d)}
					<div class="pb-[35px] relative flex flex-col border border-neutral-200 dark:border-neutral-900">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-950 {$selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-950': ''} select-none" onclick={() => $selectedDate = d}>{d.getDate()}</button>
						<div class="flex flex-col pt-2 px-2 h-[100%] overflow-y-auto" use:dropColumn={formatDate(d)}>
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
						<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950 select-none" onclick={
						() => {
							todos.add(d)
						}}>
							+
						</button>
					</div>
				{/key}
			{/each}
		</div>
	{:else}
		<div class="day flex-1 min-h-0">
			<div class="h-full pb-[35px] relative flex flex-col border border-neutral-200 dark:border-neutral-800">
				<div class="flex flex-col pt-2 px-2 h-[100%] overflow-y-auto" use:dropColumn={formatDate($selectedDate)}>
					{#each todos.onDay($selectedDate) as todo (todo.id)}
						{#if previewAt(formatDate($selectedDate), todo.id, 'before')}
							{@render dropIndicator()}
						{/if}
						<ToDo todo={todo}/>
						{#if previewAt(formatDate($selectedDate), todo.id, 'after')}
							{@render dropIndicator()}
						{/if}
					{/each}
					{#if previewAt(formatDate($selectedDate), null, 'after')}
						{@render dropIndicator()}
					{/if}
				</div>
				<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950 select-none" onclick={
					() => {
						todos.add($selectedDate)
					}}>
					+
				</button>
			</div>
		</div>
	{/if}
</div>
