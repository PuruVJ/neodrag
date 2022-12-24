import { writable } from 'svelte-local-storage-store';

export type Theme = 'light' | 'dark';
export const theme = writable<Theme>('neodrag:theme', 'light');
