import type { Component } from 'svelte';
import ComingSoon from './scenarios/ComingSoon.svelte';
import NightDesk from './scenarios/NightDesk.svelte';

export type WorldId =
	| 'night-desk'
	| 'last-mile'
	| 'split-bill'
	| 'fridge-paws'
	| 'laser-heist';

export type WorldMeta = {
	id: WorldId;
	label: string;
	hint: string;
	glyph: string;
	available: boolean;
};

/** Register worlds here — set `available: true` when the scenario is ready. */
export const WORLDS: WorldMeta[] = [
	{ id: 'night-desk', label: 'Night desk', hint: 'Drag & resize windows', glyph: '🌙', available: true },
	{ id: 'last-mile', label: 'Last mile', hint: 'Coming soon', glyph: '📦', available: false },
	{ id: 'split-bill', label: 'Split bill', hint: 'Coming soon', glyph: '🧾', available: false },
	{ id: 'fridge-paws', label: 'Fridge', hint: 'Coming soon', glyph: '🧲', available: false },
	{ id: 'laser-heist', label: 'Laser grid', hint: 'Coming soon', glyph: '💎', available: false },
];

export const DEFAULT_WORLD: WorldId = 'night-desk';

export const WORLD_COMPONENTS: Record<WorldId, Component> = {
	'night-desk': NightDesk,
	'last-mile': ComingSoon,
	'split-bill': ComingSoon,
	'fridge-paws': ComingSoon,
	'laser-heist': ComingSoon,
};

export function is_world_id(value: string): value is WorldId {
	return WORLDS.some((w) => w.id === value);
}

export function world_from_hash(hash: string): WorldId | null {
	const id = hash.replace(/^#/, '');
	return is_world_id(id) ? id : null;
}
