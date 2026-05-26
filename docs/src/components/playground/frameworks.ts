import type { Framework } from '$helpers/constants';

export type FrameworkTab = {
	id: Framework;
	label: string;
	docsPath: string;
};

export const FRAMEWORK_TABS: FrameworkTab[] = [
	{ id: 'svelte', label: 'Svelte', docsPath: '/docs/svelte' },
	{ id: 'react', label: 'React', docsPath: '/docs/react' },
	{ id: 'vue', label: 'Vue', docsPath: '/docs/vue' },
	{ id: 'solid', label: 'Solid', docsPath: '/docs/solid' },
	{ id: 'vanilla', label: 'Vanilla', docsPath: '/docs/vanilla' },
];

export const DEFAULT_FRAMEWORK: Framework = 'svelte';
