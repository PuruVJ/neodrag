import type { DndNode } from './types.ts';

/**
 * Clean translate applier for the new core. Pure side effect, idempotent (skips writes
 * when the value is unchanged), cache kept in a WeakMap (not a Symbol property on the
 * node — per the validated teardown), and no ghost/markup special-casing.
 */

const SVG_TRANSLATE =
	typeof SVGTransform !== 'undefined' ? SVGTransform.SVG_TRANSFORM_TRANSLATE : 2;

type XY = { x: number; y: number };

const cache = new WeakMap<DndNode, XY>();

export type Translator = (node: DndNode, x: number, y: number) => void;

export function applyTranslate(node: DndNode, x: number, y: number): void {
	const prev = cache.get(node);
	if (prev && prev.x === x && prev.y === y) return;
	if (prev) {
		prev.x = x;
		prev.y = y;
	} else {
		cache.set(node, { x, y });
	}

	if (node instanceof SVGElement) {
		const el = node as SVGGraphicsElement;
		const svg = el.ownerSVGElement;
		if (!svg) return;
		const list = el.transform.baseVal;
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

	(node as HTMLElement).style.translate = `${x}px ${y}px`;
}

export function clearTranslate(node: DndNode): void {
	// Idempotent: a node we never translated has no cache entry and no translate to clear, so
	// whole-list / repeat clears cost O(touched), not O(all).
	if (!cache.has(node)) return;
	cache.delete(node);
	if (node instanceof SVGElement) {
		const list = (node as SVGGraphicsElement).transform.baseVal;
		for (let i = list.numberOfItems - 1; i >= 0; i--) {
			if (list.getItem(i).type === SVG_TRANSLATE) list.removeItem(i);
		}
		return;
	}
	(node as HTMLElement).style.translate = '';
}
