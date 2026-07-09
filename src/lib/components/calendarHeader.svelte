<script lang="ts">
    import {settings} from '$lib/settings';
    import {monthName, weekNumber} from '$lib/date';
    import {ArrowBigLeft, ArrowBigRight, RefreshCcw, Eye, EyeOff} from '@lucide/svelte';
    import {views, today, currentDate, selectedDate} from "$lib/vars";

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

    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        @apply text-lg;
    }
</style>

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
