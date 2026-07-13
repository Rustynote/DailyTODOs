/**
 * Disable server-side rendering for every route.
 *
 * The app reads from `window` and `localStorage` at module evaluation time
 * (see `$lib/settings` and `$lib/todos.svelte`), so it must only ever run
 * in the browser.
 */
export const ssr = false;

/**
 * Prerender the app shell at build time.
 *
 * Combined with `ssr = false`, this generates a static HTML shell that
 * hydrates and loads data client-side, which is required for static hosting.
 */
export const prerender = true;
