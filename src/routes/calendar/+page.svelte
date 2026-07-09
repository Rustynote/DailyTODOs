<script lang="ts">
    import {settings} from '$lib/settings';
    import {formatDate, monthName, weekNumber} from '$lib/date';
    import {ArrowBigLeft, ArrowBigRight, RefreshCcw, Eye, EyeOff} from '@lucide/svelte';
    import {todos} from '$lib/todos.svelte';
    import {views, today, currentDate, selectedDate, weekDaysShortRaw} from "$lib/vars";
    import {startOfWeek, endOfWeek, startOfMonthGrid, endOfMonthGrid, daysInWeek, rangeDays} from "$lib/calendar.svelte";
    import ToDo from '$lib/components/ToDo.svelte';

    $effect(() => {
        if($settings.isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    });

    let diw = $derived(daysInWeek($settings.hideWeekend));
    let weekDaysShort = $derived($settings.hideWeekend ? weekDaysShortRaw.slice(0, 5) : weekDaysShortRaw);

    // --- Derived collections ---
    let monthDays: Date[] = $state([]);
    let monthRows: number = $state(0);
    let weekStart: Date = $state(today);
    let weekEnd: Date = $state(today);
    let weekDays: Date[] = $state([]);
    $effect(() => {
        monthDays = rangeDays(startOfMonthGrid($currentDate), endOfMonthGrid($currentDate), $currentDate, $settings.view, $settings.hideWeekend);
    });
    $effect(() => {
        monthRows = Math.floor(monthDays.length / diw);
    });
    $effect(() => {
        weekStart = startOfWeek($selectedDate);
    });
    $effect(() => {
        weekEnd = endOfWeek($selectedDate, $settings.hideWeekend);
    });
    $effect(() => {
        weekDays = rangeDays(weekStart, weekEnd, $currentDate, $settings.view, $settings.hideWeekend);
    });

    function reset() {
        $currentDate = new Date(today);

        $selectedDate = new Date(today);
    }

    // --- Navigation ---
    function prev() {
        if($settings.view === 'month') {
            $currentDate = new Date($currentDate.getFullYear(), $currentDate.getMonth() - 1, 1)
        } else if($settings.view === 'week') {
            const d = new Date($selectedDate)
            d.setDate(d.getDate() - 7)
            $selectedDate = d
        } else {
            const d = new Date($selectedDate)
            d.setDate(d.getDate() - 1)
            $selectedDate = d
        }
    }

    function next() {
        if($settings.view === 'month') {
            $currentDate = new Date($currentDate.getFullYear(), $currentDate.getMonth() + 1, 1)
        } else if($settings.view === 'week') {
            const d = new Date($selectedDate)
            d.setDate(d.getDate() + 7)
            $selectedDate = d
        } else {
            const d = new Date($selectedDate)
            d.setDate(d.getDate() + 1)
            $selectedDate = d
        }
    }

</script>

<style>
    @reference "tailwindcss";

    :global(html), :global(body) {
        height: 100vh;
    }

    :global(html) {
        @apply bg-white text-neutral-800 transition-colors;

        --view-height: calc(100vh - 62px);
        --scrollbar-track-color: #f5f7fa;
        --scrollbar-thumb-color: #d1d5db;
    }

    :global(html.dark) {
        @apply bg-zinc-800 text-white transition-colors;

        --scrollbar-track-color: #1a1a1a;
        --scrollbar-thumb-color: #525252;
    }

    /* Webkit scrollbar styles */
    ::-webkit-scrollbar {
        width: 12px;
        height: 12px;
    }

    ::-webkit-scrollbar-track {
        background: var(--scrollbar-track-color);
    }

    ::-webkit-scrollbar-thumb {
        background-color: var(--scrollbar-thumb-color);
        border-radius: 10px;
        border: 2px solid var(--scrollbar-track-color);
    }

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        @apply text-lg;
    }
</style>

<svelte:head>
	<title>Calendar - Daily TODOs</title>
	<meta name="robots" content="noindex, nofollow">
</svelte:head>

<header class="border-b-2 bg-neutral-100 border-b-neutral-200 dark:bg-zinc-800 dark:border-b-neutral-950 px-2">
	<div class="left">
		<button
				onclick={() => $settings.isDark = !$settings.isDark}
				class="px-1 py-1 rounded cursor-pointer"
		>{ $settings.isDark ? '🌙' : '🌞' }</button>
	</div>
	<div class="center flex mr-[-300px]">
		<button class="px-1 py-1 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-200" onclick={prev} title="Previous">
			<ArrowBigLeft size="20"/>
		</button>
		<div class="px-2 py-1">
			{#if $settings.view === 'month'}
				<div class="w-[150px] text-center">{monthName($currentDate)}</div>
			{:else if $settings.view === 'week'}
				{weekNumber($selectedDate)}
			{:else}
				{$selectedDate.toDateString()}
			{/if}
		</div>
		<button class="px-1 py-1 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-200" onclick={next} title="Next">
			<ArrowBigRight size="20"/>
		</button>
	</div>
	<div class="right flex">
		<button class="mr-1 px-1 py-1 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-200" onclick={reset} title="Reset">
			<RefreshCcw size="20"/>
		</button>
		<button class="inline-flex items-end justify-center line-through" onclick={() => { $settings.showDone = !$settings.showDone }}>
			{#if $settings.showDone}
				<Eye/>
			{:else}
				<EyeOff/>
			{/if}<span class="pl-1">Completed</span></button>
		<select bind:value={$settings.view} class="bg-neutral-100 dark:bg-neutral-800 mx-2">
			{#each views as w}
				<option value={w}>{w}</option>
			{/each}
		</select>
		<a href="/settings">Settings</a>
	</div>
</header>

<div class="calendar h-[calc(100vh-62px)]">
	{#if $settings.view === 'month'}
		<div class="flex text-center">
			{#each weekDaysShort as weekDayShort}
				<div class="cursor-default border-b {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-x border-neutral-200 dark:border-neutral-900">{weekDayShort}</div>
			{/each}
		</div>
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-900 text-center h-[100%]" style="--month-rows: {monthRows}">
			{#each monthDays as d}
				{#key formatDate(d)}
					<div class="h-[calc(var(--view-height)/var(--month-rows))] pb-[35px] relative flex flex-col {d.getMonth()!==$currentDate.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-900">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-800 {$selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-900': ''}" onclick={() => $selectedDate = d}>{d.getDate()}</button>
						<div class="flex flex-col px-2 h-[100%] overflow-y-auto">
							{#each todos.onDay(d) as todo}
								<ToDo todo={todo}/>
							{/each}
						</div>
						<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950" onclick={
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
		<div class="flex text-center">
			{#each weekDaysShort as weekDayShort}
				<div class="cursor-default border-b {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-x border-neutral-200 dark:border-neutral-900">{weekDayShort}</div>
			{/each}
		</div>
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-800 text-center h-[100%]" style="--month-rows: {monthRows}">
			{#each weekDays as d}
				{#key formatDate(d)}
					<div class="h-[var(--view-height)] pb-[35px] relative flex flex-col {d.getMonth()!==$currentDate.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-900">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-950 {$selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-950': ''}" onclick={() => $selectedDate = d}>{d.getDate()}</button>
						<div class="flex flex-col pt-2 px-2 h-[100%] overflow-y-auto">
							{#each todos.onDay(d) as todo}
								<ToDo todo={todo}/>
							{/each}
						</div>
						<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950" onclick={
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
		<div class="day">
			<div class="h-[var(--view-height)] pb-[35px] relative flex flex-col {$selectedDate.getMonth()!==$currentDate.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-800">
				<div class="flex flex-col pt-2 px-2 h-[100%] overflow-y-auto">
					{#each todos.onDay($selectedDate) as todo}
						<ToDo todo={todo}/>
					{/each}
				</div>
				<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-950" onclick={
					() => {
						todos.add($selectedDate)
					}}>
					+
				</button>
			</div>
		</div>
	{/if}
</div>