import { onMount } from 'svelte';

export const mounted = {
	subscribe(fn: (e: boolean) => void) {
		fn(false);
		onMount(() => fn(true));
		return () => {};
	},
};
