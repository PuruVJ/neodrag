import { readable } from 'svelte/store';

export const createIntervalStore = (ms: number) =>
	readable(new Date(), (set) => {
		const interval = setInterval(() => set(new Date()), ms);
		return () => clearInterval(interval);
	});
