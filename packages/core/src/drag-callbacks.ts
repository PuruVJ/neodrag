import type { InteractionInput } from './interaction-input.ts';
import type { SizeInput } from './length-runtime.ts';
import type { DragCtx, DragPlugin, DragPluginList, PluginSlot } from './types.ts';

export type DragEventData = Readonly<{
	offset: Readonly<{ x: SizeInput; y: SizeInput }>;
	offsetPx: Readonly<{ x: number; y: number }>;
	rootNode: HTMLElement | SVGElement;
	visualNode: HTMLElement | SVGElement;
	input: InteractionInput;
	pointer: Readonly<{ x: number; y: number }>;
}>;

export type DragCallbackHandlers = {
	onDragStart?: (data: DragEventData) => void;
	onDrag?: (data: DragEventData) => void;
	onDragEnd?: (data: DragEventData) => void;
};

const DRAG_CALLBACKS_KEY = Symbol('neodrag.dragCallbacks');

export function eventPayload(ctx: DragCtx, input: InteractionInput): DragEventData {
	return {
		offset: {
			x: ctx.offsetAuthored?.x ?? ctx.offset.x,
			y: ctx.offsetAuthored?.y ?? ctx.offset.y,
		},
		offsetPx: { x: ctx.offset.x, y: ctx.offset.y },
		rootNode: ctx.rootNode,
		visualNode: ctx.session.visual.node,
		input,
		pointer: { x: input.clientX, y: input.clientY },
	};
}

export function hasDragCallbacks(handlers: DragCallbackHandlers): boolean {
	return !!(handlers.onDragStart || handlers.onDrag || handlers.onDragEnd);
}

export function createDragCallbacksPlugin(handlers: DragCallbackHandlers): DragPlugin {
	return {
		key: DRAG_CALLBACKS_KEY,
		phase: 'post',
		skipOnCancel: true,

		start(ctx, _s, input) {
			handlers.onDragStart?.(eventPayload(ctx, input));
		},

		drag(ctx, _s, input) {
			handlers.onDrag?.(eventPayload(ctx, input));
		},

		end(ctx, _s, input) {
			handlers.onDragEnd?.(eventPayload(ctx, input));
		},
	};
}

export function appendDragCallbackSlots(
	plugins: DragPluginList,
	handlers: DragCallbackHandlers,
): readonly PluginSlot<DragPlugin>[] {
	if (!hasDragCallbacks(handlers)) return plugins;
	return [...plugins, createDragCallbacksPlugin(handlers)];
}
