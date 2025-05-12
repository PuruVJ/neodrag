export const FRAMEWORKS = [
	{ name: 'svelte' },
	{ name: 'react' },
	{ name: 'vue' },
	{ name: 'solid' },
	{ name: 'vanilla' },
] as const;

export type Framework = (typeof FRAMEWORKS)[number]['name'];

export const PLUGINS = [
	{ name: 'axis' },
	{ name: 'bounds' },
	{ name: 'controls' },
	{ name: 'disabled' },
	{ name: 'events' },
	{ name: 'grid' },
	{ name: 'position' },
	{ name: 'scrollLock' },
	{ name: 'threshold' },
	{ name: 'transform' },
	{ name: 'touchAction' },
];
