<script lang="ts">
	import '../app.css';
	import {settings} from '$lib/settings';
	import {onMount} from 'svelte';

	let { children } = $props();

	$effect(() => {
		if($settings.isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/service-worker.js', {type: 'module'});
		}
	});
</script>

{@render children?.()}
