<script lang="ts">
    import {settings} from '$lib/settings';
    import {monthName, weekNumber} from '$lib/date';
    import {views, today, currentDate, selectedDate} from "$lib/vars";

    /**
     * Reset both the displayed month/period and the selected day back to today.
     */
    function reset() {
        $currentDate = new Date(today);

        $selectedDate = new Date(today);
    }

    // --- Navigation ---

    /**
     * Move the calendar one step backward.
     *
     * The step size depends on the active view:
     * - month: previous calendar month
     * - week: 7 days earlier
     * - day: 1 day earlier
     */
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

    /**
     * Move the calendar one step forward.
     *
     * The step size depends on the active view:
     * - month: next calendar month
     * - week: 7 days later
     * - day: 1 day later
     */
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

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        @apply text-base;
    }
</style>

<header class="border-b-2 bg-neutral-100 border-b-neutral-200 dark:bg-zinc-800 dark:border-b-neutral-950 px-2 py-1 shrink-0">
	<div class="left select-none">
		<button
				onclick={() => $settings.isDark = !$settings.isDark}
				class="px-1 py-1 rounded cursor-pointer"
				title="Toggle theme"
				aria-label="Toggle theme"
		>
			{#if $settings.isDark}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"></path></svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.2"></circle><line x1="12" y1="1.5" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22.5"></line><line x1="1.5" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22.5" y2="12"></line><line x1="4.4" y1="4.4" x2="6.1" y2="6.1"></line><line x1="17.9" y1="17.9" x2="19.6" y2="19.6"></line><line x1="4.4" y1="19.6" x2="6.1" y2="17.9"></line><line x1="17.9" y1="6.1" x2="19.6" y2="4.4"></line></svg>
			{/if}
		</button>
	</div>
	<div class="center flex mr-[-300px]">
		<button class="icon-btn px-1 py-1" onclick={prev} title="Previous" aria-label="Previous">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
		</button>
		<div class="px-2 py-1 font-bold">
			{#if $settings.view === 'month'}
				<div class="w-[150px] text-center">{monthName($currentDate)}</div>
			{:else if $settings.view === 'week'}
				{weekNumber($selectedDate)}
			{:else}
				{$selectedDate.toDateString()}
			{/if}
		</div>
		<button class="icon-btn px-1 py-1" onclick={next} title="Next" aria-label="Next">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
		</button>
	</div>
	<div class="right flex items-center select-none">
		<button class="icon-btn mr-1 px-1 py-1" onclick={reset} title="Reset" aria-label="Reset">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 1 2.6 6.3"></path><polyline points="3 8 3 13 8 13"></polyline></svg>
		</button>
		<button class="inline-flex items-end justify-center" onclick={() => { $settings.showDone = !$settings.showDone }} title={$settings.showDone ? 'Hide completed' : 'Show completed'} aria-label={$settings.showDone ? 'Hide completed' : 'Show completed'}>
			{#if $settings.showDone}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.9 17.9A10.6 10.6 0 0 1 12 19c-7 0-11-7-11-7a19 19 0 0 1 5-5.6M9.5 5.4A10 10 0 0 1 12 5c7 0 11 7 11 7a19 19 0 0 1-3 3.9M14.1 14.1a3 3 0 1 1-4.2-4.2"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
			{/if}</button>
		<select bind:value={$settings.view} class="bg-neutral-100 dark:bg-neutral-800 mx-2 select-none outline-0 border rounded-sm border-neutral-200 dark:border-neutral-700 px-0.5 py-1">
			{#each views as w}
				<option value={w}>{w}</option>
			{/each}
		</select>
		<a href="/settings" title="Settings" aria-label="Settings">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="7" x2="20" y2="7"></line><circle cx="9" cy="7" r="2.2"></circle><line x1="4" y1="12" x2="20" y2="12"></line><circle cx="16" cy="12" r="2.2"></circle><line x1="4" y1="17" x2="20" y2="17"></line><circle cx="10" cy="17" r="2.2"></circle></svg>
		</a>
	</div>
</header>
