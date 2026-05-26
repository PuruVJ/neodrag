export const PLAYGROUND_FRAMEWORKS = [
	{ id: 'svelte', label: 'Svelte', docs: '/docs/svelte' },
	{ id: 'react', label: 'React', docs: '/docs/react' },
	{ id: 'vue', label: 'Vue', docs: '/docs/vue' },
	{ id: 'solid', label: 'Solid', docs: '/docs/solid' },
	{ id: 'vanilla', label: 'Vanilla', docs: '/docs/vanilla' },
] as const;

export type FrameworkId = (typeof PLAYGROUND_FRAMEWORKS)[number]['id'];

export function is_framework_id(value: string): value is FrameworkId {
	return PLAYGROUND_FRAMEWORKS.some((f) => f.id === value);
}

export function framework_meta(id: FrameworkId) {
	return PLAYGROUND_FRAMEWORKS.find((f) => f.id === id)!;
}
