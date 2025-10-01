<script lang="ts">
    import {onMount} from 'svelte';
    import {settings} from '$lib/settings';
    import { Eye, EyeOff, Check, X } from '@lucide/svelte';
    import ToDo from "../../components/ToDo.svelte";

    let isDark = $state(true)
    isDark = localStorage.getItem('isDark') === 'true' || !window.matchMedia("(prefers-color-scheme: dark)").matches;

    function toggleTheme() {
        localStorage.setItem('isDark', '' + isDark);
        isDark = !isDark;
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    toggleTheme();

    const resetHours = (d: Date) => {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
    };

    // Todo functions

    const LS_KEY = 'todos';
    type TodoItem = { id: string; title: string; date: string, done: boolean };
    let todos: TodoItem[] = $state([]);

    const todoOn = (dateStr: string) => todos.filter((e) => e.date === dateStr);
    const todoAdd = (d: Date) => {
        const id = crypto.randomUUID();
        const date = fmtDate(d);

        const todo: TodoItem = {
            id: id,
            title: '',
            date: date,
			done: false
        };

        todos.push(todo);
    };
    const todoRemove = (id: string) => {
        todos = todos.filter((e) => e.id !== id)
    }
    const todoUpdate = (id: string, title: string) => {
        todos = todos.map((e) => (e.id === id ? { ...e, title: title } : e))
	};
    const todoDone = (id: string, done: boolean = true) => {
        todos = todos.map((e) => (e.id === id ? { ...e, done: done } : e))
	};

    // utilities

	//
    // let settings = {
    //     hideWeekend: true,
    // }

    const views = ['month', 'week', 'day'];

    let today: Date = new Date();
    today = resetHours(today);
    let current: Date = $state(new Date(today));

    let selectedDate: Date = $state(new Date(today));

    const pad2 = (n: number) => String(n).padStart(2, '0')
    const fmtDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    const startOfWeek = (d: Date) => {
        const date = new Date(d)
        const day = (date.getDay() + 6) % 7 // Monday=0
        date.setDate(date.getDate() - day)
        date.setHours(0, 0, 0, 0)
        return date
    }

    const endOfWeek = (d: Date) => {
        const s = startOfWeek(d)
        const e = new Date(s)
		const days = $settings.hideWeekend ? 4 : 6;
        e.setDate(s.getDate() + days)
        return e
    }

    const startOfMonthGrid = (firstOfMonth: Date) => {
        firstOfMonth.setDate(1);
        const s = new Date(firstOfMonth)
        const dow = (s.getDay() + 6) % 7 // Monday=0
        s.setDate(1 - dow)
        s.setHours(0, 0, 0, 0)
        return s
    }

    const endOfMonthGrid = (firstOfMonth: Date) => {
        const s = startOfMonthGrid(firstOfMonth)
        const e = new Date(s)
        // e.setDate(e.getDate() + 41) // 6 weeks * 7 - 1
        e.setDate(e.getDate() + 41) // 6 weeks * 7 - 1
        return e
    }

    const diw = $settings.hideWeekend ? 5 : 7;
    const rangeDays = (start: Date, end: Date) => {
        let days: Date[] = []
        const d = new Date(start)
        let i = 0;

        // TODO: March 2025 has emptry top row
        while (d <= end) {

			if($settings.view !== 'week' && i > 10 && d.getDay() === 1 && d.getMonth() !== current.getMonth()) {
                break;
            }

            // Skip sunday and saturday if hide weekend
            if($settings.hideWeekend && [6].includes(d.getDay())) {
                d.setDate(d.getDate() + 2);

                continue;
            }

            if($settings.view !== 'week' && d.getMonth() !== current.getMonth() && i === diw-1) {
                days = [];
                i++;
                d.setDate(d.getDate() + 1);
                continue;
            }

            days.push(new Date(d));
            d.setDate(d.getDate() + 1);

            i++;

            // stop while if it's end of the week in next month
            if($settings.view !== 'week' && i > 10 && i % diw == 0 && d.getMonth() !== current.getMonth()) {
                break;
            }
        }

        return days
    }

    const monthName = (d: Date) => d.toLocaleString(undefined, {month: 'long', year: 'numeric'})
    const weekNumber = (d: any) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        return 'Week ' + Math.ceil((((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000) + 1) / 7);
    };
    const weekDaysShortRaw = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let weekDaysShort = $state(weekDaysShortRaw);
    if($settings.hideWeekend) {
        weekDaysShort = weekDaysShortRaw.splice(0, 5);
	}

    // --- State: load/save (guarded for SSR) ---
    function load() {
        try {
            const rawTodos = localStorage.getItem(LS_KEY);
            if(rawTodos) {
                todos = JSON.parse(rawTodos);
            }
        } catch (e) {
            console.error('Failed to load todos', e)
        }
    }

    function save() {
        localStorage.setItem(LS_KEY, JSON.stringify(todos))
    }

    onMount(() => {
        load();
    })

    $effect(() => {
        if(todos.length > 0)
        	save()
    });

    // --- Derived collections ---
    let monthDays: Date[] = $state([]);
    let monthRows: number = $state(0);
    let weekStart: Date = $state(today);
    let weekEnd: Date = $state(today);
    let weekDays: Date[] = $state([]);
    $effect(() => {
        monthDays = rangeDays(startOfMonthGrid(current), endOfMonthGrid(current));
    });
    $effect(() => {
        monthRows = Math.floor(monthDays.length / diw);
    });
    $effect(() => {
        weekStart = startOfWeek(selectedDate);
    });
    $effect(() => {
        weekEnd = endOfWeek(selectedDate);
    });
    $effect(() => {
        weekDays = rangeDays(weekStart, weekEnd)
    });

    function reset() {
        current = new Date(today);

        selectedDate = new Date(today);
    }

    // --- Navigation ---
    function prev() {
        if ($settings.view === 'month') {
            current = new Date(current.getFullYear(), current.getMonth() - 1, 1)
        } else if ($settings.view === 'week') {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() - 7)
        } else {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() - 1)
        }
    }

    function next() {
        if ($settings.view === 'month') {
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
        } else if ($settings.view === 'week') {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() + 7)
        } else {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() + 1)
        }
    }

	let editing: TodoItem|false = $state(false);

    const formatText = (title: string): string => {
        // Auto link
        title = title.replace(/(?![^<]*>|[^<>]*<\/)((https?:)\/\/[a-z0-9&#=.\/\-?_]+)/g, function() {
            return '<a class="cursor-text" href="'+arguments[4]+'" onclick="event.preventDefault()">'+(arguments[4] || arguments[4])+'</a>'
        });

        // Break lines
        title = title.replace(/\n/g, '<br>');

        return title;
	}
    const autoGrow = (e: any) => {
        e.target.style.height = "5px";
        e.target.style.height = (e.target.scrollHeight) + "px";
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
        @apply bg-neutral-900 text-white transition-colors;

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

<header class="border-b-2 bg-neutral-100 border-b-neutral-200 dark:bg-neutral-800 dark:border-b-neutral-950 px-2">
	<div class="left">
		<button
				onclick={toggleTheme}
				class="px-1 py-1 rounded cursor-pointer"
		>{ isDark ? '🌙' : '🌞' }</button>
	</div>
	<div class="center flex mr-[-300px]">
		<button class="mr-1 px-1 py-1 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-200" onclick={reset} title="Reset">
			↻
		</button>
		<button class="px-1 py-1 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-200" onclick={prev} title="Previous">
			⮜
		</button>
		<div class="px-2 py-1">
			{#if $settings.view === 'month'}
				<div class="w-[150px] text-center">{monthName(current)}</div>
			{:else if $settings.view === 'week'}
				{weekNumber(selectedDate)}
			{:else}
				{selectedDate.toDateString()}
			{/if}
		</div>
		<button class="px-1 py-1 cursor-pointer hover:text-neutral-500 dark:hover:text-neutral-200" onclick={next} title="Next">
			⮞
		</button>
	</div>
	<div class="right flex">
		<button class="inline-flex items-end justify-center line-through" onclick={() => { $settings.showDone = !$settings.showDone }}>{#if $settings.showDone}<Eye />{:else}<EyeOff />{/if}<span class="pl-1">Completed</span></button>
		<select bind:value={$settings.view} class="bg-neutral-100 dark:bg-neutral-800 mx-2">
			{#each views as w}
				<option value={w}>{w}</option>
			{/each}
		</select>
		<a href="/settings">Settings</a>
	</div>
</header>

<div class="calendar h-[calc(100vh-62px)]">
	{#if $settings.view === 'month'}
		<div class="flex text-center">
			{#each weekDaysShort as weekDayShort}
				<div class="cursor-default border-b-0 {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-r border-r-neutral-200 dark:border-r-neutral-700">{weekDayShort}</div>
			{/each}
		</div>
		<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-700 text-center h-[100%]" style="--month-rows: {monthRows}">
			{#each monthDays as d}
				{#key fmtDate(d)}
					<div class="h-[calc(var(--view-height)/var(--month-rows))] pb-[35px] relative flex flex-col {d.getMonth()!==current.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-700">
						<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-800 {selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-800': ''}" onclick={() => selectedDate= d}>{d.getDate()}</button>
						<div class="flex flex-col px-2 h-[100%] overflow-y-auto">
							{#each todoOn(fmtDate(d)) as todo (todo.id)}
								<div class="group w-[100] p-1 relative text-left rounded my-1 bg-neutral-100 dark:bg-gray-800  {!$settings.showDone && todo.done ? 'hidden' : ''}" draggable="true" title="Drag to move">
									{#if editing !== null && editing.id === todo.id}
										<textarea autofocus class="resize-none w-[calc(100%-60px)] min-h-4 h-[24px] ml-[10px] mr-[50px]" oninput={autoGrow} onfocusin={autoGrow} onchange={(e) => todoUpdate(todo.id, e.target.value)}>{todo.title}</textarea>
									{:else}
										<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
										<div class="w-[calc(100%-60px)] min-h-6 ml-[10px] mr-[50px] break-words cursor-text {todo.done ? 'line-through' : ''}" onclick={() => editing = todo}>{@html formatText(todo.title)}</div>
									{/if}
									<button class="absolute top-1 right-1 cursor-pointer hidden group-hover:block" title="Delete" onclick={() => todoRemove(todo.id)}><X size={20} /></button>
									<button class="absolute top-1 right-7 cursor-pointer hidden group-hover:block" title="Done" onclick={() => todoDone(todo.id, !todo.done)}><Check size={22} /></button>
								</div>
							{/each}
						</div>
						<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-white dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800" onclick={
							() => {
                                todoAdd(d)
							}}>
							+
						</button>
					</div>
				{/key}
			{/each}
		</div>
	{:else if $settings.view === 'week'}
		<div class="week">
			<div class="flex text-center">
				{#each weekDaysShort as weekDayShort}
					<div class="cursor-default border-b-0 {$settings.hideWeekend ? 'w-[calc(100%/5)]' : 'w-[calc(100%/7)]'} border-r border-r-neutral-200 dark:border-r-neutral-700">{weekDayShort}</div>
				{/each}
			</div>
			<div class="grid {$settings.hideWeekend ? 'grid-cols-5' : 'grid-cols-7'} divide-x divide-y divide-neutral-200 dark:divide-neutral-700 text-center h-[100%]" style="--month-rows: {monthRows}">
				{#each weekDays as d}
					{#key fmtDate(d)}
						<div class="h-[var(--view-height)] pb-[35px] relative flex flex-col {d.getMonth()!==current.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-700">
							<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-800 {selectedDate.getTime() === d.getTime() ? ' bg-neutral-300 dark:bg-neutral-800': ''}" onclick={() => selectedDate= d}>{d.getDate()}</button>
							<div class="flex flex-col px-2 h-[100%] overflow-y-auto">
								{#each todoOn(fmtDate(d)) as todo (todo.id)}
									<div class="group w-[100] p-1 relative text-left rounded my-1 bg-neutral-100 dark:bg-gray-800  {!$settings.showDone && todo.done ? 'hidden' : ''}" draggable="true" title="Drag to move">
										{#if editing !== null && editing.id === todo.id}
											<textarea autofocus class="resize-none w-[calc(100%-60px)] min-h-4 h-[24px] ml-[10px] mr-[50px]" oninput={autoGrow} onfocusin={autoGrow} onchange={(e) => todoUpdate(todo.id, e.target.value)}>{todo.title}</textarea>
										{:else}
											<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
											<div class="w-[calc(100%-60px)] min-h-6 ml-[10px] mr-[50px] break-words cursor-text {todo.done ? 'line-through' : ''}" onclick={() => editing = todo}>{@html formatText(todo.title)}</div>
										{/if}
										<button class="absolute top-1 right-1 cursor-pointer hidden group-hover:block" title="Delete" onclick={() => todoRemove(todo.id)}><X size={20} /></button>
										<button class="absolute top-1 right-7 cursor-pointer hidden group-hover:block" title="Done" onclick={() => todoDone(todo.id, !todo.done)}><Check size={22} /></button>
									</div>
								{/each}
							</div>
							<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-white dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800" onclick={
							() => {
                                todoAdd(d)
							}}>
								+
							</button>
						</div>
					{/key}
				{/each}
			</div>
		</div>
	{:else}
		<div class="day">
			<div class="h-[var(--view-height)] pb-[35px] relative flex flex-col {selectedDate.getMonth()!==current.getMonth() && 'bg-neutral-200 dark:bg-neutral-950'} border border-neutral-200 dark:border-neutral-700">
				<button class="rounded-[50%] mt-1 mx-auto p-2 w-[40px] cursor-pointer transition hover:bg-neutral-300 dark:hover:bg-neutral-800 {selectedDate.getTime() === selectedDate.getTime() ? ' bg-neutral-300 dark:bg-neutral-800': ''}" onclick={() => selectedDate= selectedDate}>{selectedDate.getDate()}</button>
				<div class="flex flex-col px-2 h-[100%] overflow-y-auto">
					{#each todoOn(fmtDate(selectedDate)) as todo (todo.id)}
						<div class="group w-[100] p-1 relative text-left rounded my-1 bg-neutral-100 dark:bg-gray-800  {!$settings.showDone && todo.done ? 'hidden' : ''}" draggable="true" title="Drag to move">
							{#if editing !== null && editing.id === todo.id}
								<textarea autofocus class="resize-none w-[calc(100%-60px)] min-h-4 h-[24px] ml-[10px] mr-[50px]" oninput={autoGrow} onfocusin={autoGrow} onchange={(e) => todoUpdate(todo.id, e.target.value)}>{todo.title}</textarea>
							{:else}
								<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (because of reasons) -->
								<div class="w-[calc(100%-60px)] min-h-6 ml-[10px] mr-[50px] break-words cursor-text {todo.done ? 'line-through' : ''}" onclick={() => editing = todo}>{@html formatText(todo.title)}</div>
							{/if}
							<button class="absolute top-1 right-1 cursor-pointer hidden group-hover:block" title="Delete" onclick={() => todoRemove(todo.id)}><X size={20} /></button>
							<button class="absolute top-1 right-7 cursor-pointer hidden group-hover:block" title="Done" onclick={() => todoDone(todo.id, !todo.done)}><Check size={22} /></button>
						</div>
					{/each}
				</div>
				<button class="block absolute bottom-0 w-[100%] ml-n-1 py-1 cursor-pointer font-bold bg-white dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800" onclick={
							() => {
                                todoAdd(selectedDate)
							}}>
					+
				</button>
			</div>
		</div>
	{/if}
</div>