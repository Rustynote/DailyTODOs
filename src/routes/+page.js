/**
 * Override the root layout's `ssr = false`.
 *
 * The landing page is static marketing content — server-rendering it means
 * its <svelte:head> (title, meta description, Open Graph/Twitter tags) is
 * actually baked into the prerendered static HTML, which is required for
 * crawlers and social-media unfurlers that don't execute JavaScript.
 */
export const ssr = true;
