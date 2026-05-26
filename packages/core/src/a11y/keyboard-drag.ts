import { resolveSizeInput, sizeContext } from '../length-contract.ts';
import { defineDragPlugin } from '../types.ts';
import {
	registerKeyboardDrag,
	unregisterKeyboardDrag,
	type KeyboardDragOptions,
	type ResolvedKeyboardDragOptions,
} from './keyboard-drag-registry.ts';

export const KEYBOARD_DRAG_KEY = Symbol('neodrag.keyboardDrag');

export const keyboardDrag = defineDragPlugin((options: KeyboardDragOptions | null = {}) => {
	const resolved: ResolvedKeyboardDragOptions = {
		grabKey: options?.grabKey ?? 'Space',
		step: 1,
		axis: options?.axis ?? null,
		slowInterval: options?.slowInterval ?? 400,
		speedupDelay: options?.speedupDelay ?? 800,
		fastInterval: options?.fastInterval ?? 50,
		fastStep: 4,
	};

	return {
		key: KEYBOARD_DRAG_KEY,

		init(ctx) {
			const wCtx = sizeContext(ctx.rootNode, 'width');
			const stepPx = resolveSizeInput(ctx.length, options?.step ?? 1, wCtx, 1);
			registerKeyboardDrag(ctx.rootNode, { ...resolved, step: stepPx });
			const rect = ctx.rootNode.getBoundingClientRect();
			return {
				virtualX: rect.left + rect.width / 2,
				virtualY: rect.top + rect.height / 2,
			};
		},

		destroy(ctx) {
			unregisterKeyboardDrag(ctx.rootNode);
		},
	};
});
