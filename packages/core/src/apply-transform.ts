import { set_node_key_style } from './utils.ts';
import type { DragCtx } from './types.ts';

export type TransformApplier = (args: {
	offset: { x: number; y: number };
	rootNode: HTMLElement | SVGElement;
}) => void;

const TRANSFORM_CACHE = Symbol('neodrag.transformCache');

const SVG_TRANSFORM_TRANSLATE =
	typeof SVGTransform !== 'undefined' ? SVGTransform.SVG_TRANSFORM_TRANSLATE : 2;

type TransformCache = { x: number; y: number };

function transformCache(node: HTMLElement | SVGElement): TransformCache {
	const host = node as HTMLElement & { [TRANSFORM_CACHE]?: TransformCache };
	return (host[TRANSFORM_CACHE] ??= { x: NaN, y: NaN });
}

export function applyDragTransform(ctx: DragCtx, custom?: TransformApplier) {
	const targetNode = ctx.isDragging ? ctx.session.visual.node : ctx.rootNode;
	if (custom) {
		custom({ offset: { x: ctx.offset.x, y: ctx.offset.y }, rootNode: targetNode });
		return;
	}

	const x = ctx.offset.x;
	const y = ctx.offset.y;
	const cache = transformCache(targetNode);
	if (cache.x === x && cache.y === y) return;
	cache.x = x;
	cache.y = y;

	if (targetNode instanceof SVGElement) {
		const element = targetNode as SVGGraphicsElement;
		const svg = element.ownerSVGElement;
		if (!svg) return;
		const t = element.transform.baseVal;
		let translateIndex = -1;
		for (let i = 0; i < t.numberOfItems; i++) {
			if (t.getItem(i).type === SVG_TRANSFORM_TRANSLATE) {
				translateIndex = i;
				break;
			}
		}
		if (translateIndex >= 0) {
			t.getItem(translateIndex).setTranslate(x, y);
		} else {
			const translation = svg.createSVGTransform();
			translation.setTranslate(x, y);
			t.insertItemBefore(translation, 0);
		}
	} else {
		(targetNode as HTMLElement).style.translate = `${x}px ${y}px`;
	}
}
