import { writable } from 'svelte-local-storage-store';

import type { Framework } from 'src/helpers/constants';

export const selectedFramework = writable<Framework>('neodrag:selectedFramework', 'svelte');

export type Theme = 'light' | 'dark';
export const theme = writable<Theme>('neodrag:theme', 'light');
