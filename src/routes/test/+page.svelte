<!-- src/routes/+page.svelte (SvelteKit) -->
<script lang="ts">
    import { onMount } from 'svelte'
    import { browser } from '$app/environment'
    import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';


    // Simple, no-backend calendar with month/week/day views,
    // click-to-add entries, and drag-and-drop between days.
    // Persistence via localStorage. SvelteKit-safe (guards SSR).

    type CalendarView = 'month' | 'week' | 'day'
    type EventItem = { id: string; title: string; date: string }

    let view: CalendarView = 'month'
    let today = new Date()
    let current: Date = new Date(today.getFullYear(), today.getMonth(), 1)
    let selectedDate: Date = new Date(today)
    let events: EventItem[] = []
    let newTitle = ''
    let showAddDialog = false
    let pendingAddDate: string | null = null // yyyy-mm-dd

    const LS_KEY = 'svelte-calendar-events'

    // --- Utilities ---
    const pad2 = (n: number) => String(n).padStart(2, '0')
    const fmtDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
    const parseDate = (s: string) => {
        const [y, m, d] = s.split('-').map(Number)
        return new Date(y, m - 1, d)
    }

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
        e.setDate(s.getDate() + 6)
        return e
    }

    const startOfMonthGrid = (firstOfMonth: Date) => {
        const s = new Date(firstOfMonth)
        const dow = (s.getDay() + 6) % 7 // Monday=0
        s.setDate(1 - dow)
        s.setHours(0, 0, 0, 0)
        return s
    }

    const endOfMonthGrid = (firstOfMonth: Date) => {
        const s = startOfMonthGrid(firstOfMonth)
        const e = new Date(s)
        e.setDate(e.getDate() + 41) // 6 weeks * 7 - 1
        return e
    }

    const rangeDays = (start: Date, end: Date) => {
        const days: Date[] = []
        const d = new Date(start)
        while (d <= end) {
            days.push(new Date(d))
            d.setDate(d.getDate() + 1)
        }
        return days
    }

    const monthName = (d: Date) => d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    const weekdayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    // --- State: load/save (guarded for SSR) ---
    function load() {
        if (!browser) return
        try {
            const raw = localStorage.getItem(LS_KEY)
            if (raw) events = JSON.parse(raw)
        } catch (e) {
            console.error('Failed to load events', e)
        }
    }
    function save() {
        if (!browser) return
        localStorage.setItem(LS_KEY, JSON.stringify(events))
    }

    onMount(() => {
        // establish client-only date anchors to avoid hydration mismatches
        today = new Date()
        current = new Date(today.getFullYear(), today.getMonth(), 1)
        selectedDate = new Date(today)

        load()
    })

    // persist on any change (client only)
    $: if (browser) save()

    // --- Event ops ---
    function addEvent(dateStr: string, title: string) {
        const item: EventItem = {
            id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
            title: title.trim(),
            date: dateStr
        }
        if (!item.title) return
        events = [...events, item]
    }

    function moveEvent(id: string, toDateStr: string) {
        events = events.map((e) => (e.id === id ? { ...e, date: toDateStr } : e))
    }

    function deleteEvent(id: string) {
        events = events.filter((e) => e.id !== id)
    }

    function openAdd(dateStr: string) {
        pendingAddDate = dateStr
        newTitle = ''
        showAddDialog = true
    }

    function submitAdd() {
        if (pendingAddDate) addEvent(pendingAddDate, newTitle)
        showAddDialog = false
        pendingAddDate = null
        newTitle = ''
    }

    function cancelAdd() {
        showAddDialog = false
        pendingAddDate = null
        newTitle = ''
    }

    // --- Navigation ---
    function prev() {
        if (view === 'month') {
            current = new Date(current.getFullYear(), current.getMonth() - 1, 1)
        } else if (view === 'week') {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() - 7)
        } else {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() - 1)
        }
    }

    function next() {
        if (view === 'month') {
            current = new Date(current.getFullYear(), current.getMonth() + 1, 1)
        } else if (view === 'week') {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() + 7)
        } else {
            selectedDate = new Date(selectedDate)
            selectedDate.setDate(selectedDate.getDate() + 1)
        }
    }

    function goToday() {
        today = new Date()
        if (view === 'month') current = new Date(today.getFullYear(), today.getMonth(), 1)
        selectedDate = new Date(today)
    }

    // --- Drag & Drop ---
    function onDragStart(event: DragEvent, id: string) {
        event.dataTransfer?.setData('text/plain', id)
        event.dataTransfer?.setData('application/x-event-id', id)
        event.dataTransfer!.effectAllowed = 'move'
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault()
        event.dataTransfer!.dropEffect = 'move'
    }

    function onDrop(event: DragEvent, toDateStr: string) {
        event.preventDefault()
        const id = event.dataTransfer?.getData('application/x-event-id') || event.dataTransfer?.getData('text/plain')
        if (id) moveEvent(id, toDateStr)
    }

    // --- Derived collections ---
    $: monthDays = rangeDays(startOfMonthGrid(current), endOfMonthGrid(current))
    $: weekStart = startOfWeek(selectedDate)
    $: weekEnd = endOfWeek(selectedDate)
    $: weekDays = rangeDays(weekStart, weekEnd)

    const eventsOn = (dateStr: string) => events.filter((e) => e.date === dateStr)

    function classNames(...list: Array<string | false | null | undefined>) {
        return list.filter(Boolean).join(' ')
    }
</script>

<style>
    :global(body) {
        margin: 0;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji';
        color: #0f172a; /* slate-900 */
        background: #f8fafc; /* slate-50 */
    }
    .app { max-width: 1100px; margin: 24px auto; padding: 0 16px 48px; }
    header { display: flex; align-items: center; gap: 12px; justify-content: space-between; margin-bottom: 12px; }
    .titlebar { display: flex; align-items: center; gap: 8px; }
    .btn { border: 1px solid #e2e8f0; background: white; padding: 8px 12px; border-radius: 10px; cursor: pointer; transition: 120ms ease-in-out; }
    .btn:hover { box-shadow: 0 1px 0 rgba(0,0,0,.06); }
    .btn.primary { background: #0ea5e9; color: white; border-color: #0ea5e9; }
    .segmented { display: inline-flex; background: #e2e8f0; border-radius: 12px; padding: 4px; gap: 4px; }
    .segmented button { background: white; border: none; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
    .segmented button[aria-pressed="true"] { background: #0ea5e9; color: white; }
    .month { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
    .dow { font-size: 12px; color: #475569; padding: 4px 6px; }
    .cell { background: white; border: 1px solid #e2e8f0; min-height: 110px; border-radius: 10px; padding: 6px; display: flex; flex-direction: column; gap: 6px; }
    .cell.muted { color: #94a3b8; background: #f8fafc; }
    .cell .date { font-size: 12px; font-weight: 600; color: #334155; display: flex; align-items: center; justify-content: space-between; }
    .chip { font-size: 12px; background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; padding: 6px 8px; border-radius: 8px; cursor: grab; user-select: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .chip button { border: none; background: transparent; cursor: pointer; color: #0c4a6e; }
    .addlink { color: #0284c7; font-size: 12px; cursor: pointer; }
    .week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
    .week .col { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px; min-height: 200px; display: flex; flex-direction: column; gap: 6px; }
    .col .colhdr { font-weight: 600; font-size: 13px; color: #334155; display: flex; justify-content: space-between; align-items: center; }
    .day { background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
    dialog::backdrop { background: rgba(15,23,42,.3); }
    dialog { border: none; border-radius: 12px; padding: 0; overflow: hidden; }
    .dialog-card { padding: 16px; background: white; min-width: 320px; display: grid; gap: 12px; }
    .row { display: grid; gap: 6px; }
    input[type="text"], input[type="date"] { border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; font-size: 14px; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; }
</style>

<div class="app">
	<header>
		<div class="titlebar">
			<button class="btn" on:click={prev} title="Previous">◀</button>
			<button class="btn" on:click={goToday}>Today</button>
			<button class="btn" on:click={next} title="Next">▶</button>
			{#if view === 'month'}
				<h2 style="margin-left:8px;">{monthName(current)}</h2>
			{:else if view === 'week'}
				<h2 style="margin-left:8px;">{weekStart.toLocaleDateString()} – {weekEnd.toLocaleDateString()}</h2>
			{:else}
				<h2 style="margin-left:8px;">{selectedDate.toDateString()}</h2>
			{/if}
		</div>
		<div class="segmented" role="tablist" aria-label="Calendar view">
			<button role="tab" aria-pressed={view==='month'} on:click={() => view='month'}>Month</button>
			<button role="tab" aria-pressed={view==='week'} on:click={() => view='week'}>Week</button>
			<button role="tab" aria-pressed={view==='day'} on:click={() => view='day'}>Day</button>
		</div>
	</header>

	{#if view === 'month'}
		<div class="month">
			{#each weekdayShort as wd}
				<div class="dow">{wd}</div>
			{/each}

			{#each monthDays as d}
				{#key fmtDate(d)}
					<div
							class={classNames('cell', d.getMonth()!==current.getMonth() && 'muted')}
							on:dragover|preventDefault={onDragOver}
							on:drop={(e)=>onDrop(e, fmtDate(d))}
					>
						<div class="date">
							<span>{d.getDate()}</span>
							<a class="addlink" href="#" on:click|preventDefault={() => openAdd(fmtDate(d))}>＋</a>
						</div>
						{#each eventsOn(fmtDate(d)) as ev (ev.id)}
							<div class="chip" draggable="true" on:dragstart={(e)=>onDragStart(e, ev.id)} title="Drag to move">
								<span>{ev.title}</span>
								<button title="Delete" on:click={() => deleteEvent(ev.id)}>✕</button>
							</div>
						{/each}
					</div>
				{/key}
			{/each}
		</div>
	{:else if view === 'week'}
		<div class="week">
			{#each weekDays as d}
				<div class="col" on:dragover|preventDefault={onDragOver} on:drop={(e)=>onDrop(e, fmtDate(d))}>
					<div class="colhdr">
						<span>{weekdayShort[(d.getDay()+6)%7]} {d.getDate()} {d.toLocaleString(undefined,{month:'short'})}</span>
						<a class="addlink" href="#" on:click|preventDefault={() => openAdd(fmtDate(d))}>＋</a>
					</div>
					{#each eventsOn(fmtDate(d)) as ev (ev.id)}
						<div class="chip" draggable="true" on:dragstart={(e)=>onDragStart(e, ev.id)}>
							<span>{ev.title}</span>
							<button title="Delete" on:click={() => deleteEvent(ev.id)}>✕</button>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<div class="day" on:dragover|preventDefault={onDragOver} on:drop={(e)=>onDrop(e, fmtDate(selectedDate))}>
			<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
				<strong>{selectedDate.toDateString()}</strong>
				<button class="btn" on:click={() => openAdd(fmtDate(selectedDate))}>Add entry</button>
			</div>
			{#if eventsOn(fmtDate(selectedDate)).length === 0}
				<p style="color:#64748b;">No entries yet. Click “Add entry” to create one.</p>
			{:else}
				{#each eventsOn(fmtDate(selectedDate)) as ev (ev.id)}
					<div class="chip" draggable="true" on:dragstart={(e)=>onDragStart(e, ev.id)}>
						<span>{ev.title}</span>
						<button title="Delete" on:click={() => deleteEvent(ev.id)}>✕</button>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

{#if showAddDialog}
	<dialog open>
		<div class="dialog-card">
			<h3 style="margin:0;">Add entry</h3>
			<div class="row">
				<label>Title</label>
				<input type="text" bind:value={newTitle} placeholder="e.g. Project kickoff" on:keydown={(e)=>{ if(e.key==='Enter') submitAdd() }} />
			</div>
			<div class="row">
				<label>Date</label>
				<input type="date" bind:value={pendingAddDate} />
			</div>
			<div class="actions">
				<button class="btn" on:click={cancelAdd}>Cancel</button>
				<button class="btn primary" on:click={submitAdd} disabled={!newTitle.trim()}>Save</button>
			</div>
		</div>
	</dialog>
{/if}
