<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import {settings} from '$lib/settings';

	let { children } = $props();

	$effect(() => {
		if($settings.isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});
</script>

<svelte:head>
<!--	<link rel="icon" href={favicon} />-->
</svelte:head>

{@render children?.()}
