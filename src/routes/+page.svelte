<!-- src/routes/+page.svelte or src/lib/components/Landing.svelte -->
<script lang="ts">
    import { fade, fly, scale } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';

    const features = [
        {
            title: 'Manage Your Tasks',
            description:
                'Add, update, delete, reorder, and drag tasks to different days with smooth interactions.',
            icon: 'edit'
        },
        {
            title: 'Flexible Calendar Views',
            description:
                'Switch between monthly, weekly, and daily views. Click any day to add entries instantly.',
            icon: 'calendar'
        },
        {
            title: 'Hide Weekends',
            description:
                'Declutter your workspace by hiding Saturdays and Sundays to widen columns and focus.',
            icon: 'view'
        },
        {
            title: 'Import & Export',
            description:
                'Backup or share your data. Export to a file and import it back in seconds.',
            icon: 'arrows'
        },
        {
            title: 'Themes',
            description:
                'Toggle between dark and light modes to match your vibe and environment.',
            icon: 'theme'
        },
        {
            title: 'Start of Week',
            description:
                'Choose Sunday, Monday, or Saturday as the first day of your week.',
            icon: 'week'
        }
    ];

    function iconPath(name: string) {
        switch (name) {
            case 'edit':
                return 'M11 5H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11 12l-4 1 1-4 8.586-8.586z';
            case 'calendar':
                return 'M8 7V3m8 4V3M3 9h18M5 12h14v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8z';
            case 'view':
                return 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 4a4 4 0 100-8 4 4 0 000 8z';
            case 'arrows':
                return 'M4 4v6h6M20 20v-6h-6M4 10l7-7M20 14l-7 7';
            case 'theme':
                return 'M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z';
            case 'week':
                return 'M3 5a2 2 0 012-2h2v2H5v2H3V5zm4 0h2v2H7V5zm4-2h2v2h-2V3zm4 0h2a2 2 0 012 2v2h-2V5h-2V3zM3 9h18v12a2 2 0 01-2 2H5a2 2 0 01-2-2V9z';
            default:
                return 'M12 2l9 4-9 4-9-4 9-4zm0 7l9 4-9 4-9-4 9-4z';
        }
    }
</script>

<style>
    /* Optional: smooth scroll */
    html { scroll-behavior: smooth; }
</style>

<svelte:head>
	<title>Daily TODOs - Fast, offline, todo calendar</title>
	<meta name="description" content="A lightweight, backend-free daily planner with draggable todos, flexible views, weekend hiding, and portable data.">
</svelte:head>

<!-- Page wrapper -->
<section class="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
	<!-- Decorative glow -->
	<div class="pointer-events-none absolute inset-0 [mask-image:radial-gradient(50%_50%_at_50%_0%,black,transparent)]">
		<div class="absolute -top-24 left-1/2 h-72 w-[110vw] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"></div>
		<div class="absolute top-24 left-1/3 h-56 w-[70vw] -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl"></div>
	</div>

	<!-- Nav -->
	<nav class="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
		<div class="flex items-center gap-3" in:fly={{ y: -12, duration: 350, easing: cubicOut }}>
			<div class="grid h-9 w-9 place-items-center rounded-2xl bg-white text-slate-900 shadow-lg shadow-cyan-500/20">
				<!-- App Glyph -->
				<svg viewBox="0 0 24 24" class="h-6 w-6" aria-hidden="true">
					<path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</div>
			<span class="font-semibold tracking-tight">Daily TODOs</span>
		</div>

		<div class="hidden items-center gap-3 sm:flex" in:fly={{ y: -12, duration: 350, delay: 75, easing: cubicOut }}>
			<a href="#features" class="rounded-xl px-4 py-2 text-sm text-white/80 hover:text-white">Features</a>
			<a href="#why" class="rounded-xl px-4 py-2 text-sm text-white/80 hover:text-white">Why</a>
			<a href="#cta" class="rounded-xl px-4 py-2 text-sm text-white/80 hover:text-white">Get Started</a>
		</div>
	</nav>

	<!-- Hero -->
	<header class="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-20 pt-8 md:grid-cols-2 lg:gap-16">
		<div in:fly={{ x: -16, duration: 400, easing: cubicOut }}>
			<h1 class="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
				Plan your days with a <span class="bg-gradient-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">fast, offline</span> Svelte calendar
			</h1>
			<p class="mt-5 max-w-prose text-base text-white/80 sm:text-lg">
				A lightweight, backend-free daily planner with draggable todos, flexible views, weekend hiding, and portable data.
			</p>
			<div class="mt-8 flex flex-wrap items-center gap-3">
				<a href="/calendar" class="rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px] hover:shadow-xl" in:scale={{ start: 0.9, duration: 200 }}>
					Open the App
				</a>
				<a href="#features" class="rounded-2xl border border-white/15 px-5 py-3 font-medium text-white/90 transition hover:border-white/25 hover:bg-white/5">
					Explore Features
				</a>
			</div>

			<!-- Trust / bullets -->
			<ul class="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-white/70 sm:grid-cols-2">
				<li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> No backend. Works offline.</li>
				<li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Built with SvelteKit & Tailwind.</li>
				<li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span> Keyboard-friendly and fast.</li>
				<li class="flex items-center gap-2"><span class="h-1.5 w-1.5 rounded-full bg-indigo-400"></span> Import / Export your data.</li>
			</ul>
		</div>

		<!-- Mockup Card -->
		<div class="relative" in:fly={{ x: 16, duration: 400, easing: cubicOut }}>
			<div class="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 blur-2xl"></div>
			<div class="relative rounded-3xl border border-white/10 bg-slate-900/60 p-4 shadow-2xl backdrop-blur">
				<div class="rounded-2xl border border-white/10 bg-slate-900 p-4">
					<!-- Simple calendar mock -->
					<div class="mb-3 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full bg-red-500/80"></div>
							<div class="h-3 w-3 rounded-full bg-yellow-500/80"></div>
							<div class="h-3 w-3 rounded-full bg-green-500/80"></div>
						</div>
						<div class="text-sm text-white/70">Weekly View</div>
					</div>

					<div class="grid grid-cols-7 gap-2 text-xs text-white/70">
						{#each ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as d}
							<div class="text-center">{d}</div>
						{/each}
					</div>

					<div class="mt-2 grid grid-cols-7 gap-2">
						{#each Array(7) as _, i}
							<div class="min-h-[7rem] rounded-lg border border-white/10 bg-slate-800/50 p-2">
								<div class="mb-1 text-[10px] text-white/50">{i + 1}</div>
								<!-- fake todos -->
								{#if i < 5}
									<div class="mb-1 rounded-md bg-cyan-500/20 px-2 py-1 text-[11px] text-cyan-200">Design review</div>
								{/if}
								{#if i === 2}
									<div class="rounded-md bg-indigo-500/20 px-2 py-1 text-[11px] text-indigo-200">Ship v1 export</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Features -->
	<section id="features" class="relative z-10 mx-auto max-w-7xl px-6 py-16">
		<h2 class="text-center text-3xl font-semibold sm:text-4xl" in:fade>Everything you need to plan</h2>
		<p class="mx-auto mt-3 max-w-2xl text-center text-white/70" in:fade={{ delay: 100 }}>
			Daily TODOs focuses on speed, simplicity, and the exact controls you asked for.
		</p>

		<div class="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as f, idx}
				<article class="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg transition hover:shadow-xl hover:shadow-cyan-500/10" in:fly={{ y: 24, duration: 350, delay: 60 * idx, easing: cubicOut }}>
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-indigo-400/20">
						<svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2">
							<path d={iconPath(f.icon)} stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</div>
					<h3 class="text-lg font-semibold">{f.title}</h3>
					<p class="mt-2 text-sm text-white/70">{f.description}</p>
					<div class="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-500/10 opacity-0 blur-2xl transition group-hover:opacity-100"></div>
				</article>
			{/each}
		</div>
	</section>

	<!-- Why -->
	<section id="why" class="relative z-10 mx-auto max-w-7xl px-6 py-16">
		<div class="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
			<div in:fly={{ x: -16, duration: 350, easing: cubicOut }}>
				<h2 class="text-3xl font-semibold sm:text-4xl">Why Daily TODOs?</h2>
				<ul class="mt-6 space-y-3 text-white/80">
					<li class="flex items-start gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-cyan-400"></span> No backend — your data stays with you and works offline.</li>
					<li class="flex items-start gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-indigo-400"></span> SvelteKit + Tailwind = instant interactions and tiny bundle.</li>
					<li class="flex items-start gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-cyan-400"></span> Keyboard and drag-and-drop focused productivity.</li>
					<li class="flex items-start gap-3"><span class="mt-2 h-2 w-2 rounded-full bg-indigo-400"></span> Clean design that stays out of your way.</li>
				</ul>
			</div>
			<div class="relative" in:fly={{ x: 16, duration: 350, easing: cubicOut }}>
				<div class="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 blur-2xl"></div>
				<div class="relative rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl">
					<div class="grid grid-cols-2 gap-4">
						<div class="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
							<div class="text-sm font-medium">Dark Mode</div>
							<div class="mt-2 h-28 rounded-xl bg-slate-900/70"></div>
						</div>
						<div class="rounded-2xl border border-white/10 bg-slate-100 p-4 text-slate-900">
							<div class="text-sm font-medium">Light Mode</div>
							<div class="mt-2 h-28 rounded-xl bg-slate-200"></div>
						</div>
						<div class="col-span-2 rounded-2xl border border-white/10 bg-slate-800/60 p-4">
							<div class="text-sm font-medium">Start of Week</div>
							<div class="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-white/70">
								{#each ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as d}
									<div class="rounded-md bg-slate-900/60 py-1">{d}</div>
								{/each}
							</div>
							<p class="mt-2 text-xs text-white/50">Choose Sunday, Monday, or Saturday.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA -->
	<section id="cta" class="relative z-10 mx-auto max-w-7xl px-6 pb-24">
		<div class="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 p-8 text-center shadow-xl" in:fade>
			<h3 class="text-2xl font-semibold sm:text-3xl">Ready to build better days?</h3>
			<p class="mx-auto mt-2 max-w-2xl text-white/80">Open the app, import your data if you have it, and start dragging tasks where they belong.</p>
			<div class="mt-6 flex flex-wrap justify-center gap-3">
				<a href="/calendar" class="rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 shadow-lg transition hover:translate-y-[-1px] hover:shadow-xl">Open the App</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="relative z-10 border-t border-white/10 bg-slate-950/50 py-8 text-center text-sm text-white/50">
		<p>© {new Date().getFullYear()} Daily TODOs. Built with SvelteKit.</p>
	</footer>
</section>
