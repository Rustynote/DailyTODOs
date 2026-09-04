<!-- SettingsPanel.svelte -->

<script lang="ts">
	import {settings, resetSettings} from '$lib/settings';
	import {todos} from '$lib/todos.svelte';
	import {weekStartOptions, themeOptions, isSettingsOpen} from '$lib/vars';

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

	/**
	 * Wipe all todos and reset settings to their defaults, after confirming
	 * with the user since this discards all stored data.
	 */
	function removeData() {
		if(!confirm('This will permanently delete all todos and settings. This cannot be undone. Continue?')) {
			return;
		}

		todos.clear();
		resetSettings();
	}
</script>

<style>
    @reference "tailwindcss";
</style>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (backdrop just needs to close the panel on click) -->
<div class="fixed inset-0 z-40 bg-black/50" onclick={() => $isSettingsOpen = false}></div>

<aside class="fixed inset-y-0 right-0 z-50 w-[320px] h-screen overflow-y-auto bg-panel border-l border-divider px-5 py-4">
	<div class="flex items-center justify-between">
		<h1 class="text-xl font-bold">Settings</h1>
		<button
				type="button"
				onclick={() => $isSettingsOpen = false}
				class="icon-btn p-1"
				title="Close settings"
				aria-label="Close settings"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
		</button>
	</div>

	<h2 class="mt-8 mb-2 text-lg font-semibold">Theme</h2>
	<select bind:value={$settings.theme} class="w-full bg-neutral-100 dark:bg-neutral-800 border border-input-border rounded px-3 py-2">
		{#each themeOptions as t}
			<option value={t}>{t[0].toUpperCase() + t.slice(1)}</option>
		{/each}
	</select>

	<h2 class="mt-8 mb-2 text-lg font-semibold">Weekends</h2>
	<label><input type="checkbox" bind:checked={$settings.hideWeekend}> Hide weekends</label>

	<h2 class="mt-8 mb-2 text-lg font-semibold">Start of Week</h2>
	{#if $settings.hideWeekend}
		<p class="mb-2 text-sm text-neutral-500 dark:text-neutral-400">Unavailable while weekends are hidden, since Saturday and Sunday are excluded either way.</p>
	{/if}
	<select bind:value={$settings.weekStart} disabled={$settings.hideWeekend} class="w-full bg-neutral-100 dark:bg-neutral-800 border border-input-border rounded px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed">
		{#each weekStartOptions as w}
			<option value={w}>{w[0].toUpperCase() + w.slice(1)}</option>
		{/each}
	</select>

	<h2 class="mt-8 mb-2 text-lg font-semibold">Import / Export</h2>
	<p class="mb-4 text-sm">Export your todos to a JSON file, or import a previously exported file. Importing replaces all current todos.</p>
	<div class="flex items-center flex-wrap gap-2">
		<button type="button" onclick={exportTodos} class="cursor-pointer focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900">Export</button>

		<label class="cursor-pointer focus:outline-none text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-900">
			Import
			<input type="file" accept="application/json" class="hidden" onchange={importTodos}>
		</label>
	</div>
	{#if importError}
		<p class="mb-4 text-sm text-red-600 dark:text-red-400">{importError}</p>
	{/if}

	<h2 class="mt-8 mb-2 text-lg font-semibold">Remove Data</h2>
	<p class="mb-4 text-sm">This action cannot be undone.</p>
	<button type="button" onclick={removeData} class="cursor-pointer focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">Remove</button>
</aside>
