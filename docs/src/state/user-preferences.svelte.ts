import { persisted } from './persisted.svelte';

export type Theme = 'light' | 'dark';
export const theme = persisted<Theme>('neodrag:theme', 'light');
