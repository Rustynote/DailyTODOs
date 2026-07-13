<script lang="ts">
	import {settings} from '$lib/settings';
	import {
		ListChecks,
		GripVertical,
		Link2,
		Image,
		EyeOff,
		CalendarClock,
		ArrowLeftRight,
		Eraser,
		SunMoon,
		LayoutGrid,
		Download,
		ServerOff,
		MonitorSmartphone
	} from '@lucide/svelte';

	const stack = [
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'Tailwind CSS',
		'Vite',
		'Pragmatic drag & drop',
		'Service Worker'
	];

	const features = [
		{
			icon: ListChecks,
			title: 'Add, complete & remove todos',
			description: 'Jot down a task, check it off when it\'s done, or delete it entirely — all in one click.'
		},
		{
			icon: GripVertical,
			title: 'Drag and drop',
			description: 'Reorder todos or drag them onto a different day to reschedule instantly.'
		},
		{
			icon: Link2,
			title: 'Auto-linked URLs',
			description: 'Paste a link into a todo and it becomes clickable automatically — no markup needed.'
		},
		{
			icon: Image,
			title: 'Inline image embeds',
			description: 'Image URLs are rendered right in the todo, so visual references stay in context.'
		},
		{
			icon: EyeOff,
			title: 'Hide weekends',
			description: 'Declutter the calendar by hiding Saturday and Sunday whenever you don\'t need them.'
		},
		{
			icon: CalendarClock,
			title: 'Custom start of week',
			description: 'Set your week to start on Saturday, Sunday, or Monday — whatever fits your routine.'
		},
		{
			icon: ArrowLeftRight,
			title: 'Import & export',
			description: 'Back up your todos to a JSON file, or import one to restore or move your data.'
		},
		{
			icon: Eraser,
			title: 'Clean up your data',
			description: 'Wipe everything and start fresh in one step, right from Settings.'
		},
		{
			icon: SunMoon,
			title: 'Light & dark theme',
			description: 'Switch between light and dark mode to suit your eyes, any time of day.'
		},
		{
			icon: LayoutGrid,
			title: 'Month, week & day views',
			description: 'Zoom out for the big picture or zoom in on today — switch views in one click.'
		},
		{
			icon: MonitorSmartphone,
			title: 'Synced across tabs',
			description: 'Open the app in multiple tabs and your todos and settings stay in sync automatically.'
		},
		{
			icon: Download,
			title: 'Installable & offline-capable',
			description: 'Install it as an app and keep using it without a network connection.'
		}
	];
</script>

<svelte:head>
	<title>Daily TODOs - Fast, offline todo calendar</title>
	<meta name="description" content="A lightweight, backend-free daily planner with draggable todos, flexible views, weekend hiding, and portable data.">
</svelte:head>

<div class="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
	<!-- Nav -->
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
		<div class="flex items-center gap-2 font-semibold text-lg">
			<span aria-hidden="true"><img src="/icons/icon-512.png" alt="Daily TODOs header icon" class="max-w-8"></span>
			<span>Daily TODOs</span>
		</div>

		<div class="flex items-center gap-2">
			<button
					onclick={() => $settings.isDark = !$settings.isDark}
					class="cursor-pointer rounded px-2 py-1 text-lg"
					title="Toggle theme"
			>{$settings.isDark ? '🌙' : '🌞'}</button>
			<a href="/calendar" class="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">Open the App</a>
		</div>
	</nav>

	<!-- Hero -->
	<header class="mx-auto max-w-6xl px-6 pb-16 pt-8 text-center">
		<h1 class="text-4xl font-bold leading-tight sm:text-5xl">
			A fast, offline todo calendar
		</h1>
		<p class="mx-auto mt-5 max-w-xl text-neutral-600 dark:text-neutral-400 sm:text-lg">
			No backend, no account, no tracking. Your todos live in your browser and work whether or not you're online.
		</p>
		<div class="mt-8 flex flex-wrap items-center justify-center gap-3">
			<a href="/calendar" class="rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">Open the App</a>
			<a href="#features" class="rounded-lg border border-neutral-300 px-5 py-3 font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900">See Features</a>
		</div>
	</header>

	<!-- Features -->
	<section id="features" class="mx-auto max-w-6xl px-6 py-16">
		<h2 class="text-center text-3xl font-semibold">Everything you need to plan your days</h2>

		<div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as f}
				{@const Icon = f.icon}
				<article class="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-neutral-900">
					<div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
						<Icon size={20}/>
					</div>
					<h3 class="font-semibold">{f.title}</h3>
					<p class="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">{f.description}</p>
				</article>
			{/each}
		</div>
	</section>

	<!-- Built with / No backend -->
	<section class="mx-auto max-w-6xl px-6 py-16">
		<div class="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
			<div>
				<h2 class="text-3xl font-semibold">Built with</h2>
				<p class="mt-3 text-neutral-600 dark:text-neutral-400">A small, modern stack chosen to keep things fast and simple.</p>
				<div class="mt-5 flex flex-wrap gap-2">
					{#each stack as s}
						<span class="rounded-full border border-neutral-300 px-3 py-1 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">{s}</span>
					{/each}
				</div>
			</div>

			<div class="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/40">
				<div class="flex items-start gap-4">
					<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
						<ServerOff size={22}/>
					</div>
					<div>
						<h3 class="font-semibold text-blue-900 dark:text-blue-200">There is no backend. Really.</h3>
						<p class="mt-1.5 text-sm text-blue-900/80 dark:text-blue-200/80">Everything is pre-rendered into static files and runs entirely in your browser. Your todos are saved to <code class="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">localStorage</code> on your device — no server, no account, no sign-up, and nothing ever sent over the network.</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section class="mx-auto max-w-6xl px-6 pb-24">
		<div class="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900">
			<h3 class="text-2xl font-semibold">Ready to plan your days?</h3>
			<p class="mx-auto mt-2 max-w-xl text-neutral-600 dark:text-neutral-400">Open the app and start adding todos — everything is saved locally as you go.</p>
			<a href="/calendar" class="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700">Open the App</a>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
		<p>© {new Date().getFullYear()} Daily TODOs</p>
	</footer>
</div>
