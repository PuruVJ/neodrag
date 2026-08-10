import type { Component } from 'svelte';
import ExtrasBench from './scenarios/ExtrasBench.svelte';
import FridgePaws from './scenarios/FridgePaws.svelte';
import IndicatorSwitch from './scenarios/IndicatorSwitch.svelte';
import LastMile from './scenarios/LastMile.svelte';
import LaserHeist from './scenarios/LaserHeist.svelte';
import NightDesk from './scenarios/NightDesk.svelte';
import RealtimeCollab from './scenarios/RealtimeCollab.svelte';
import ResizeDesk from './scenarios/ResizeDesk.svelte';
import SplitBill from './scenarios/SplitBill.svelte';
import StickerGrid from './scenarios/StickerGrid.svelte';
import Workshop from './scenarios/Workshop.svelte';

export type WorldId =
	| 'workshop'
	| 'night-desk'
	| 'last-mile'
	| 'split-bill'
	| 'fridge-paws'
	| 'laser-heist'
	| 'sticker-grid'
	| 'realtime-collab'
	| 'resize-desk'
	| 'indicator-switch'
	| 'extras-bench';

export type WorldMeta = {
	id: WorldId;
	label: string;
	tagline: string;
	available: boolean;
};

export const WORLDS: WorldMeta[] = [
	{
		id: 'realtime-collab',
		label: 'Realtime collab',
		tagline: 'Two peers, one list — synced live',
		available: true,
	},
	{
		id: 'workshop',
		label: 'Workshop',
		tagline: 'Drag · resize · rotate — one node',
		available: true,
	},
	{
		id: 'night-desk',
		label: 'Night desk',
		tagline: 'Bounded panels that stack',
		available: true,
	},
	{
		id: 'last-mile',
		label: 'Last mile',
		tagline: 'Grid snap + green drop zones',
		available: true,
	},
	{
		id: 'split-bill',
		label: 'Split bill',
		tagline: 'Latte slots + sortable splits',
		available: true,
	},
	{
		id: 'fridge-paws',
		label: 'Fridge paws',
		tagline: 'Swap magnets — live poem',
		available: true,
	},
	{
		id: 'laser-heist',
		label: 'Heist board',
		tagline: 'Kanban transfer across columns',
		available: true,
	},
	{
		id: 'sticker-grid',
		label: 'Sticker grid',
		tagline: '2D grid sortable — snap to cell',
		available: true,
	},
	{
		id: 'indicator-switch',
		label: 'Drop indicator',
		tagline: 'Push gap vs. drop-line + ghost',
		available: true,
	},
	{
		id: 'resize-desk',
		label: 'Resize desk',
		tagline: 'Edge + corner resize, bounded',
		available: true,
	},
	{
		id: 'extras-bench',
		label: 'Extras bench',
		tagline: 'Opt-in use:[] plugins — snap to grid',
		available: true,
	},
];

export const DEFAULT_WORLD: WorldId = 'realtime-collab';

export const WORLD_COMPONENTS: Record<WorldId, Component<{ world: WorldMeta }>> = {
	workshop: Workshop,
	'night-desk': NightDesk,
	'last-mile': LastMile,
	'split-bill': SplitBill,
	'fridge-paws': FridgePaws,
	'laser-heist': LaserHeist,
	'sticker-grid': StickerGrid,
	'realtime-collab': RealtimeCollab,
	'resize-desk': ResizeDesk,
	'indicator-switch': IndicatorSwitch,
	'extras-bench': ExtrasBench,
};

export function parse_world_from_hash(hash: string): WorldId | null {
	const id = hash.replace(/^#/, '').trim();
	if (WORLDS.some((w) => w.id === id)) {
		return id as WorldId;
	}
	return null;
}
