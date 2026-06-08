import type { Component } from 'svelte';
import FridgePaws from './scenarios/FridgePaws.svelte';
import LastMile from './scenarios/LastMile.svelte';
import LaserHeist from './scenarios/LaserHeist.svelte';
import NightDesk from './scenarios/NightDesk.svelte';
import SplitBill from './scenarios/SplitBill.svelte';

export type WorldId = 'night-desk' | 'last-mile' | 'split-bill' | 'fridge-paws' | 'laser-heist';

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
		tagline: 'Bounded panels that stack',
		available: true,
	},
	{
		id: 'last-mile',
		label: 'Last mile',
		glyph: '📦',
		tagline: 'Grid snap + green drop zones',
		available: true,
	},
	{
		id: 'split-bill',
		label: 'Split bill',
		glyph: '🧾',
		tagline: 'Latte slots + sortable splits',
		available: true,
	},
	{
		id: 'fridge-paws',
		label: 'Fridge paws',
		glyph: '🐾',
		tagline: 'Swap magnets — live poem',
		available: true,
	},
	{
		id: 'laser-heist',
		label: 'Heist board',
		glyph: '💎',
		tagline: 'Kanban transfer across columns',
		available: true,
	},
];

export const DEFAULT_WORLD: WorldId = 'night-desk';

export const WORLD_COMPONENTS: Record<WorldId, Component> = {
	'night-desk': NightDesk,
	'last-mile': LastMile,
	'split-bill': SplitBill,
	'fridge-paws': FridgePaws,
	'laser-heist': LaserHeist,
};

export function parse_world_from_hash(hash: string): WorldId | null {
	const id = hash.replace(/^#/, '').trim();
	if (WORLDS.some((w) => w.id === id)) {
		return id as WorldId;
	}
	return null;
}
