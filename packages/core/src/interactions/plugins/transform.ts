import { set_node_key_style } from '../../utils.ts';
import type { DragCtx, DragPlugin } from '../types.ts';
import { TRANSFORM_KEY } from './keys.ts';

const TRANSFORM_CACHE = Symbol('neodrag.transformCache');

type TransformCache = { x: number; y: number };

function transformCache(node: HTMLElement | SVGElement): TransformCache {
	const host = node as HTMLElement & { [TRANSFORM_CACHE]?: TransformCache };
	return (host[TRANSFORM_CACHE] ??= { x: NaN, y: NaN });
}

function writeTransform(
	ctx: DragCtx,
	func?: (args: { offset: { x: number; y: number }; rootNode: HTMLElement | SVGElement }) => void,
) {
	const targetNode = ctx.isDragging ? ctx.session.visual.node : ctx.rootNode;
	if (func) {
		func({ offset: { x: ctx.offset.x, y: ctx.offset.y }, rootNode: targetNode });
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
		const translation = svg.createSVGTransform();
		translation.setTranslate(x, y);
		const t = element.transform.baseVal;
		t.clear();
		t.appendItem(translation);
	} else {
		set_node_key_style(
			targetNode,
			'translate',
			`${x}px ${y}px 0.000000001px`,
		);
	}
}

export const transform: DragPlugin = {
	key: TRANSFORM_KEY,
	name: 'transform',
	phase: 'post',
	skipOnCancel: true,

	init(ctx) {
		writeTransform(ctx);
	},

	update(ctx) {
		writeTransform(ctx);
	},

	drag(ctx) {
		ctx.effect(() => writeTransform(ctx));
	},
};

export const transformWith = (
	func?: (args: {
		offset: { x: number; y: number };
		rootNode: HTMLElement | SVGElement;
	}) => void,
): DragPlugin => ({
	...transform,
	key: Symbol('neodrag.transform.custom'),
	name: 'transform-custom',
	init(ctx) {
		writeTransform(ctx, func);
	},
	update(ctx) {
		writeTransform(ctx, func);
	},
	drag(ctx) {
		ctx.effect(() => writeTransform(ctx, func));
	},
});
