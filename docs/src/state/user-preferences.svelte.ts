import { browser } from '$helpers/utils';
import { persisted } from './persisted.svelte';

export type Theme = 'light' | 'dark';
export const theme = persisted<Theme>(
	'neodrag:theme',
	browser
		? matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'
		: 'light',
);
