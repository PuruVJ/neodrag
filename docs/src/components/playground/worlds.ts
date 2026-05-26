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
	glyph: string;
	tagline: string;
	available: boolean;
};

export const WORLDS: WorldMeta[] = [
	{
		id: 'night-desk',
		label: 'Night desk',
		glyph: '🌙',
		tagline: 'Stack and drag floating panels',
		available: true,
	},
	{
		id: 'last-mile',
		label: 'Last mile',
		glyph: '📦',
		tagline: 'Route packages on a map',
		available: false,
	},
	{
		id: 'split-bill',
		label: 'Split bill',
		glyph: '🧾',
		tagline: 'Drag items between friends',
		available: false,
	},
	{
		id: 'fridge-paws',
		label: 'Fridge paws',
		glyph: '🐾',
		tagline: 'Magnetic fridge poetry',
		available: false,
	},
	{
		id: 'laser-heist',
		label: 'Laser heist',
		glyph: '💎',
		tagline: 'Sneak past moving beams',
		available: false,
	},
];

export const DEFAULT_WORLD: WorldId = 'night-desk';

export const WORLD_COMPONENTS: Record<WorldId, Component> = {
	'night-desk': NightDesk,
	'last-mile': ComingSoon,
	'split-bill': ComingSoon,
	'fridge-paws': ComingSoon,
	'laser-heist': ComingSoon,
};

export function parse_world_from_hash(hash: string): WorldId | null {
	const id = hash.replace(/^#/, '');
	if (WORLDS.some((w) => w.id === id && w.available)) {
		return id as WorldId;
	}
	return null;
}
