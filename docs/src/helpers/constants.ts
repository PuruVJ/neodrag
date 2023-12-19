export const FRAMEWORKS = [
	{ name: 'svelte' },
	{ name: 'react' },
	{ name: 'vue' },
	{ name: 'solid' },
	{ name: 'angular' },
	{ name: 'vanilla' },
] as const;

export type Framework = (typeof FRAMEWORKS)[number]['name'];
