# Daily TODOs

A fast, offline-first todo calendar. No backend, no account, no tracking — everything runs in your browser and is saved to `localStorage` on your device.

Live at [dailytodo.work](https://dailytodo.work).

## Features

- Add, complete, and remove todos
- Drag and drop to reorder todos or move them to a different day
- URLs in a todo are auto-linked; image URLs are embedded inline
- Hide weekends to declutter the calendar
- Choose the start of the week (Saturday, Sunday, or Monday)
- Import/export your todos as a JSON file
- Clean up (wipe) all stored data from Settings
- Light and dark theme
- Month, week, and day calendar views
- Installable, offline-capable PWA

## Tech stack

- [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5) with `adapter-static` — the whole app is prerendered to static files, no server required
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Pragmatic drag and drop](https://atlassian.design/components/pragmatic-drag-and-drop) for reordering todos
- A service worker for precaching and offline support

## Developing

Install dependencies, then start a dev server:

```sh
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Build a production version of the app:

```sh
npm run build
```

This produces a fully static site in `build/` (SSR is disabled and every route is prerendered), so it can be hosted on any static file host. Preview the production build with `npm run preview`.

## Deployment

Pushes to `master` are automatically built and deployed to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

## Type checking

```sh
npm run check
```
