<script lang="ts">
    import {settings} from '$lib/settings';
    import {monthName, weekNumber} from '$lib/date';
    import {views, today, currentDate, selectedDate, isSettingsOpen} from "$lib/vars";

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

<header class="border-b-2 bg-header border-b-header-border px-2 py-1 shrink-0">
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
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
		</button>
		<button class="inline-flex items-end justify-center cursor-pointer" onclick={() => { $settings.showDone = !$settings.showDone }} title={$settings.showDone ? 'Hide completed' : 'Show completed'} aria-label={$settings.showDone ? 'Hide completed' : 'Show completed'}>
			{#if $settings.showDone}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path><path d="m2 2 20 20"></path></svg>
			{/if}</button>
		<select bind:value={$settings.view} class="bg-neutral-100 dark:bg-neutral-800 mx-2 select-none outline-0 border rounded-sm border-input-border px-0.5 py-1">
			{#each views as w}
				<option value={w}>{w}</option>
			{/each}
		</select>
		<button class="icon-btn px-1 py-1" onclick={() => $isSettingsOpen = !$isSettingsOpen} title="Settings" aria-label="Settings" aria-pressed={$isSettingsOpen}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="14" y1="4" y2="4"></line><line x1="10" x2="3" y1="4" y2="4"></line><line x1="21" x2="12" y1="12" y2="12"></line><line x1="8" x2="3" y1="12" y2="12"></line><line x1="21" x2="16" y1="20" y2="20"></line><line x1="12" x2="3" y1="20" y2="20"></line><line x1="14" x2="14" y1="2" y2="6"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="16" x2="16" y1="18" y2="22"></line></svg>
		</button>
	</div>
</header>
