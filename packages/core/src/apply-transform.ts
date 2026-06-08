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

export function clearDragTransform(node: HTMLElement | SVGElement) {
	const cache = transformCache(node);
	cache.x = NaN;
	cache.y = NaN;
	if (node instanceof SVGElement) {
		const element = node as SVGGraphicsElement;
		const t = element.transform.baseVal;
		for (let i = t.numberOfItems - 1; i >= 0; i--) {
			if (t.getItem(i).type === SVG_TRANSFORM_TRANSLATE) t.removeItem(i);
		}
		return;
	}
	(node as HTMLElement).style.translate = '';
}

export function applyDragTransform(ctx: DragCtx, custom?: TransformApplier) {
	const visualNode = ctx.session.visual.node;
	let targetNode = ctx.isDragging ? visualNode : ctx.rootNode;
	if (ctx.isDragging && visualNode !== ctx.rootNode) {
		clearDragTransform(ctx.rootNode);
		if (targetNode === ctx.rootNode) targetNode = visualNode;
	}
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
		const el = targetNode as HTMLElement;
		if (ctx.isDragging && el.classList.contains('neodrag-ghost')) {
			const originLeft = Number(el.dataset.ghostOriginLeft);
			const originTop = Number(el.dataset.ghostOriginTop);
			el.style.translate = '';
			el.style.left = `${originLeft}px`;
			el.style.top = `${originTop}px`;
			el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
			return;
		}
		el.style.translate = `${x}px ${y}px`;
	}
}
