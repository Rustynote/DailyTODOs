<!-- calendarContent.svelte -->

<script lang="ts">
	import {settings} from "$lib/settings";
	import {weekDaysShortRaw} from "$lib/vars";

    let weekDaysShort = $settings.hideWeekend ? weekDaysShortRaw.slice(0, 5) : weekDaysShortRaw;

    let rows: number = 1;

</script>

{#if $settings.view === 'month' || $settings.view === 'week'}
	<div class="flex text-center">
		{#each weekDaysShort as weekDayShort}
			<div class="cursor-default border-b {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-x border-neutral-200 dark:border-neutral-900">{weekDayShort}</div>
		{/each}
	</div>
{/if}
<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-900 text-center h-[100%]" style="--month-rows: {rows}">
</div>