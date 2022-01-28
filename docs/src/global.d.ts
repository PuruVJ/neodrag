// @ts-check
/// <reference types="@sveltejs/kit" />

declare module '*.svx' {
	import type { SvelteComponentTyped } from 'svelte/internal';

	class Comp extends SvelteComponentTyped<{}, {}, {}> {}

	const metadata: Record<string, any>;

	export { Comp as default, metadata };
}
