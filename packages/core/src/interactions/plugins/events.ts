import type { DragCtx } from '../types.ts';
import { defineDragPlugin } from '../types.ts';
import { EVENTS_KEY } from './keys.ts';

export type DragEventData = Readonly<{
	offset: Readonly<{ x: number; y: number }>;
	rootNode: HTMLElement | SVGElement;
	visualNode: HTMLElement | SVGElement;
	event: PointerEvent;
}>;

function payload(ctx: DragCtx, e: PointerEvent): DragEventData {
	return {
		offset: { x: ctx.offset.x, y: ctx.offset.y },
		rootNode: ctx.rootNode,
		visualNode: ctx.session.visual.node,
		event: e,
	};
}

export const events = defineDragPlugin(
	(handlers: {
		onDragStart?: (data: DragEventData) => void;
		onDrag?: (data: DragEventData) => void;
		onDragEnd?: (data: DragEventData) => void;
	} = {}) => ({
		key: EVENTS_KEY,
		name: 'events',
		phase: 'post',
		skipOnCancel: true,

		start(ctx, _s, e) {
			handlers.onDragStart?.(payload(ctx, e));
		},

		drag(ctx, _s, e) {
			handlers.onDrag?.(payload(ctx, e));
		},

		end(ctx, _s, e) {
			handlers.onDragEnd?.(payload(ctx, e));
		},
	}),
);
