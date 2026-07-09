<script lang="ts">
    import {settings} from '$lib/settings';
    import {monthName, weekNumber} from '$lib/date';
    import {ArrowBigLeft, ArrowBigRight, RefreshCcw, Eye, EyeOff} from '@lucide/svelte';
    import {views, today, currentDate, selectedDate} from "$lib/vars";
    import CalendarContent from '$lib/components/calendarContent.svelte';

    $effect(() => {
        if($settings.isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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

<CalendarContent/>