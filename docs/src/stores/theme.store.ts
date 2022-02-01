import { browser } from '$app/env';
import { writable } from 'svelte-local-storage-store';

export type Theme = 'light' | 'dark';

export const theme = writable<Theme>(
	'macos:theme-settings',
	browser && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
);

theme.subscribe((scheme) => {
	if (!browser) return;

	// Color scheme
	const { classList } = document.body;
	classList.remove('light', 'dark');
	classList.add(scheme);
});
