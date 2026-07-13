<script lang="ts">
	import {settings} from '$lib/settings';
	import {todos} from '$lib/todos.svelte';

	let importError = $state('');

	/**
	 * Download all current todos as a JSON file.
	 */
	function exportTodos() {
		const blob = new Blob([JSON.stringify(todos.export(), null, 2)], {type: 'application/json'});
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'todos.json';
		a.click();

		URL.revokeObjectURL(url);
	}

	/**
	 * Read the file picked from the import input and replace all todos with
	 * its contents, after confirming with the user since this discards
	 * whatever todos are currently stored.
	 *
	 * @param e Change event from the file input.
	 */
	async function importTodos(e: Event & {currentTarget: HTMLInputElement}) {
		const file = e.currentTarget.files?.[0];
		e.currentTarget.value = '';

		if(!file) return;

		importError = '';

		if(!confirm('Importing will replace all current todos. This cannot be undone. Continue?')) {
			return;
		}

		try {
			const data = JSON.parse(await file.text());

			if(!todos.import(data)) {
				importError = "That file doesn't look like a valid todos export.";
			}
		} catch {
			importError = 'Could not read that file as JSON.';
		}
	}
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
	<label><input type="checkbox" bind:checked={$settings.hideWeekend}> Hide weekends</label>

	<h2 class="mt-20 mb-2 text-3xl">Import / Export</h2>
	<p class="mb-4">Export your todos to a JSON file, or import a previously exported file. Importing replaces all current todos.</p>
	<div class="flex items-center flex-wrap">
		<button type="button" onclick={exportTodos} class="cursor-pointer focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900">Export</button>

		<label class="cursor-pointer focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900">
			Import
			<input type="file" accept="application/json" class="hidden" onchange={importTodos}>
		</label>
	</div>
	{#if importError}
		<p class="mb-4 text-red-600 dark:text-red-400">{importError}</p>
	{/if}

	<h2 class="mt-20 mb-2 text-3xl">Remove Data</h2>
	<p class="mb-4">This action cannot be undone.</p>
	<button type="button" onclick={() => {localStorage.clear()}} class="cursor-pointer focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-lg px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Remove</button>
</div>