import type { DndNode } from './types.ts';

/**
 * Translate applier for the core. Position is the sum of independent per-capability
 * contributions keyed by a `symbol`: drag writes its offset, resize writes the position
 * shift a `w`/`n` edge induces (to pin the far edge). They compose on one node without
 * clobbering each other — the module sums every contribution and writes one `translate`.
 *
 * Pure side effect, idempotent (skips the DOM write when the composed value is unchanged),
 * caches kept in WeakMaps (not Symbol props on the node — per the validated teardown), and
 * no ghost/markup special-casing. Legacy 3-arg callers (sortable, ghost) land on a shared
 * `DEFAULT` key, preserving their single-contributor behaviour.
 */

const SVG_TRANSLATE =
	typeof SVGTransform !== 'undefined' ? SVGTransform.SVG_TRANSFORM_TRANSLATE : 2;

type XY = { x: number; y: number };

/** Capability key for a translate contribution. Same key → same contribution slot. */
export const TRANSLATE_DEFAULT = Symbol('neodrag.translate.default');
export const TRANSLATE_DRAG = Symbol('neodrag.translate.drag');
export const TRANSLATE_RESIZE = Symbol('neodrag.translate.resize');

/** Per-node contributions, and the last-applied composed sum (for the idempotent skip). */
const parts = new WeakMap<DndNode, Map<symbol, XY>>();
const applied = new WeakMap<DndNode, XY>();

export type Translator = (node: DndNode, x: number, y: number) => void;

export function applyTranslate(
	node: DndNode,
	x: number,
	y: number,
	key: symbol = TRANSLATE_DEFAULT,
): void {
	let map = parts.get(node);
	if (!map) {
		map = new Map();
		parts.set(node, map);
	}
	const prev = map.get(key);
	if (prev) {
		if (prev.x === x && prev.y === y) return;
		prev.x = x;
		prev.y = y;
	} else {
		map.set(key, { x, y });
	}
	compose(node, map);
}

/**
 * Remove a translate contribution. With a `key`, drop just that capability's part and re-compose
 * the rest; without one, clear the node entirely (legacy whole-node reset used by sortable/ghost).
 */
export function clearTranslate(node: DndNode, key?: symbol): void {
	const map = parts.get(node);
	if (!map) return;
	if (key !== undefined && map.size > 1) {
		if (!map.delete(key)) return;
		compose(node, map);
		return;
	}
	parts.delete(node);
	applied.delete(node);
	write_translate(node, 0, 0, true);
}

function compose(node: DndNode, map: Map<symbol, XY>): void {
	let x = 0;
	let y = 0;
	for (const part of map.values()) {
		x += part.x;
		y += part.y;
	}
	const prev = applied.get(node);
	if (prev && prev.x === x && prev.y === y) return;
	if (prev) {
		prev.x = x;
		prev.y = y;
	} else {
		applied.set(node, { x, y });
	}
	write_translate(node, x, y, false);
}

function write_translate(node: DndNode, x: number, y: number, clear: boolean): void {
	if (node instanceof SVGElement) {
		const el = node as SVGGraphicsElement;
		// jsdom (and non-graphics SVG nodes) may not implement `transform` — nothing to write there.
		const list = el.transform?.baseVal;
		if (!list) return;
		if (clear) {
			for (let i = list.numberOfItems - 1; i >= 0; i--) {
				if (list.getItem(i).type === SVG_TRANSLATE) list.removeItem(i);
			}
			return;
		}
		const svg = el.ownerSVGElement;
		if (!svg) return;
		for (let i = 0; i < list.numberOfItems; i++) {
			if (list.getItem(i).type === SVG_TRANSLATE) {
				list.getItem(i).setTranslate(x, y);
				return;
			}
		}
		const t = svg.createSVGTransform();
		t.setTranslate(x, y);
		list.insertItemBefore(t, 0);
		return;
	}

	(node as HTMLElement).style.translate = clear ? '' : `${x}px ${y}px`;
}
