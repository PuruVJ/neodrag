import type { InteractionInput } from '../interaction-input.ts';
import type { DndNode } from '../types.ts';
import {
	formatLength,
	parseLength,
	pxToUnit,
	readAuthoredAxis,
	type CssLengthUnit,
} from '../units.ts';
import type { ResizeEdge } from './resize.ts';

/**
 * Tier-2 resize extension seam — the mirror of `DragPlugin`. A plain object, no reactive
 * slots, no reconcile machinery. `onMove` may return an adjusted size; `onEnd` is the place
 * to commit a final authored value back to the node.
 */
export interface ResizePlugin {
	name?: string;
	onStart?(ctx: ResizePluginContext): void;
	onMove?(ctx: ResizePluginContext): { width: number; height: number } | void;
	onEnd?(ctx: ResizePluginContext): void;
}

export interface ResizePluginContext {
	/** Current px size for this frame. */
	size: { width: number; height: number };
	/** Px size captured at resize-start. */
	initial: { width: number; height: number };
	anchor: ResizeEdge;
	node: DndNode;
	input: InteractionInput;
}

interface AuthoredAxis {
	unit: CssLengthUnit;
}

/**
 * Opt-in plugin that preserves authored CSS units across a resize. On start it reads the
 * authored unit for each axis (e.g. `width: 50%`, `height: 12rem`); throughout the drag the
 * core writes plain `px` so the geometry is exact; on end it converts the final px size back
 * into the original unit and writes it as the committed value — so a `%`-sized box stays
 * `%`-sized after resizing. Ported from `src/length/*` but kept as a tier-2 plugin, not core.
 */
export function preserveUnits(): ResizePlugin {
	let width: AuthoredAxis | null = null;
	let height: AuthoredAxis | null = null;

	function read(node: DndNode, axis: 'width' | 'height'): AuthoredAxis | null {
		const authored = readAuthoredAxis(node, axis);
		if (!authored) return null;
		const parsed = parseLength(authored);
		if (!parsed || parsed.unit === 'px') return null;
		return { unit: parsed.unit };
	}

	function commit(axis: AuthoredAxis | null, px: number, name: 'width' | 'height', node: DndNode) {
		if (!axis || !(node instanceof HTMLElement)) return;
		node.style[name] = `${formatLength(pxToUnit(px, axis.unit, name, node))}${axis.unit}`;
	}

	return {
		name: 'preserve-units',
		onStart(ctx) {
			width = read(ctx.node, 'width');
			height = read(ctx.node, 'height');
		},
		onEnd(ctx) {
			commit(width, ctx.size.width, 'width', ctx.node);
			commit(height, ctx.size.height, 'height', ctx.node);
			width = null;
			height = null;
		},
	};
}
