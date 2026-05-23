import { set_node_key_style } from '../../utils.ts';
import type { DragCtx, DragPlugin } from '../types.ts';
import { TRANSFORM_KEY } from './keys.ts';

function writeTransform(
	ctx: DragCtx,
	func?: (args: { offset: { x: number; y: number }; rootNode: HTMLElement | SVGElement }) => void,
) {
	const targetNode = ctx.isDragging ? ctx.session.visual.node : ctx.rootNode;
	if (func) {
		func({ offset: { x: ctx.offset.x, y: ctx.offset.y }, rootNode: targetNode });
		return;
	}

	if (targetNode instanceof SVGElement) {
		const element = targetNode as SVGGraphicsElement;
		const svg = element.ownerSVGElement;
		if (!svg) return;
		const translation = svg.createSVGTransform();
		translation.setTranslate(ctx.offset.x, ctx.offset.y);
		const t = element.transform.baseVal;
		t.clear();
		t.appendItem(translation);
	} else {
		set_node_key_style(
			targetNode,
			'translate',
			`${ctx.offset.x}px ${ctx.offset.y}px 0.000000001px`,
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
