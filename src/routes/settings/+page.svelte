<script lang="ts">
	import {settings} from '$lib/settings';
</script>

<style>
    @reference "tailwindcss";
</style>

<svelte:head>
	<title>Calendar Settings - Daily TODOs</title>
	<meta name="robots" content="noindex, nofollow">
</svelte:head>

<div class="container mx-auto py-20">

	<a href="/calendar" class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Back to Calendar</a>


	<h2 class="mt-20 mb-2 text-3xl">Weekends</h2>
	<label><input type="checkbox" bind:checked={$settings.hideWeekend}>Hide weekends</label>

	<h2 class="mt-20 mb-2 text-3xl">Remove Data</h2>
	<p class="mb-4">This action cannot be undone.</p>
	<button type="button" onclick={() => {localStorage.clear()}} class="cursor-pointer focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Remove</button>
</div>