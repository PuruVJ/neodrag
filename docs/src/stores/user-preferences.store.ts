import { writable } from 'svelte-local-storage-store';
import { browser } from '../helpers/utils';

export type Theme = 'light' | 'dark';
export const theme = writable<Theme>('neodrag:theme', 'light');
export const prefersReducedMotion = writable<boolean>(
	'neodrag:prefersReducedMotion',
	!browser
		? true
		: globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches
);
