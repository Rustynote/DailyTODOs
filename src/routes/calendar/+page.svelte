<script lang="ts">
    import CalendarHeader from '$lib/components/calendarHeader.svelte';
    import CalendarContent from '$lib/components/calendarContent.svelte';
</script>

<style>
    @reference "tailwindcss";

    :global(html), :global(body) {
        height: 100vh;
        display: flex;
        flex-direction: column;
    }

    :global(html) {
        @apply bg-white text-neutral-800 transition-colors;

        --scrollbar-track-color: #f5f7fa;
        --scrollbar-thumb-color: #d1d5db;
    }

    :global(html.dark) {
        @apply bg-zinc-800 transition-colors;
        color: oklch(0.95 0.006 55);

        --scrollbar-track-color: #1a1a1a;
        --scrollbar-thumb-color: #525252;
    }

    /* Webkit scrollbar styles */
    :global(::-webkit-scrollbar) {
        width: 12px;
        height: 12px;
    }

    :global(::-webkit-scrollbar-track) {
        background: var(--scrollbar-track-color);
    }

    :global(::-webkit-scrollbar-thumb) {
        background-color: var(--scrollbar-thumb-color);
        border-radius: 10px;
        border: 2px solid var(--scrollbar-track-color);
    }
</style>

<svelte:head>
	<title>Calendar - Daily TODOs</title>
	<meta name="robots" content="noindex, nofollow">
</svelte:head>

<CalendarHeader/>
<CalendarContent/>
