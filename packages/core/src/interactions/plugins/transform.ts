import { set_node_key_style } from '../../utils.ts';
import type { DragCtx, DragPlugin } from '../types.ts';
import { TRANSFORM_KEY } from './keys.ts';

function apply_transform(
	ctx: DragCtx,
	func?: (args: { offset: { x: number; y: number }; rootNode: HTMLElement | SVGElement }) => void,
) {
	const targetNode = ctx.session.visual.node;
	const is_svg = targetNode instanceof SVGElement;

	ctx.effect(() => {
		if (func) {
			func({ offset: { x: ctx.offset.x, y: ctx.offset.y }, rootNode: targetNode });
			return;
		}

		if (is_svg) {
			const element = targetNode as SVGGraphicsElement;
			const svg = element.ownerSVGElement;
			if (!svg) return;

			const translation = svg.createSVGTransform();
			translation.setTranslate(ctx.offset.x, ctx.offset.y);
			const transform = element.transform.baseVal;
			transform.clear();
			transform.appendItem(translation);
		} else {
			set_node_key_style(
				targetNode,
				'translate',
				`${ctx.offset.x}px ${ctx.offset.y}px 0.000000001px`,
			);
		}
	});
}

export const transform: DragPlugin = {
	key: TRANSFORM_KEY,
	name: 'transform',
	phase: 'post',
	skipOnCancel: true,

	init(ctx) {
		apply_transform(ctx);
	},

	drag(ctx) {
		apply_transform(ctx);
	},
};

export const transformWith =
	(
		func?: (args: {
			offset: { x: number; y: number };
			rootNode: HTMLElement | SVGElement;
		}) => void,
	): DragPlugin => ({
		...transform,
		key: Symbol('neodrag.transform.custom'),
		name: 'transform-custom',
		init(ctx) {
			apply_transform(ctx, func);
		},
		drag(ctx) {
			apply_transform(ctx, func);
		},
	});
