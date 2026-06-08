import { resolveSizeInput, sizeContext } from '../length-contract.ts';
import type { SizeInput } from '../length-runtime.ts';
import { defineDropPlugin, type DropCtx } from '../types.ts';
import {
	ACCEPTS_KEY,
	COLLISION_PRIORITY_KEY,
	COLLISION_STRATEGY_KEY,
	DROP_HIT_EXPAND_KEY,
	HIGHLIGHT_KEY,
	ON_DROP_KEY,
} from './keys.ts';

export type DropCollisionStrategy = 'pointer' | 'closestCenter';
export const accepts = defineDropPlugin(<T>(predicate: (data: T) => boolean) => ({
	key: ACCEPTS_KEY,
	phase: 'pre',

	enter(ctx) {
		const data = ctx.session.data as T;
		if (!predicate(data)) return false;
	},
}));

function highlightClasses(overClass?: string): string[] {
	return (overClass ?? 'neodrag-drop-over').split(/\s+/).filter(Boolean);
}

export const highlight = defineDropPlugin((options: { overClass?: string } = {}) => ({
	key: HIGHLIGHT_KEY,
	phase: 'post',

	init() {
		return { classes: highlightClasses(options.overClass) };
	},

	enter(ctx, state) {
		for (const cls of state.classes) ctx.rootNode.classList.add(cls);
	},

	leave(ctx, state) {
		for (const cls of state.classes) ctx.rootNode.classList.remove(cls);
	},

	destroy(ctx, state) {
		for (const cls of state.classes) ctx.rootNode.classList.remove(cls);
	},
}));

export const onDrop = defineDropPlugin(<T>(handler: (data: T, ctx: DropCtx) => void) => ({
	key: ON_DROP_KEY,
	phase: 'post',

	drop(ctx) {
		handler(ctx.session.data as T, ctx);
	},
}));

export const collisionPriority = defineDropPlugin((priority = 0) => ({
	key: COLLISION_PRIORITY_KEY,
	phase: 'pre' as const,

	init() {
		return priority;
	},
}));

export const collisionStrategy = defineDropPlugin((strategy: DropCollisionStrategy = 'pointer') => ({
	key: COLLISION_STRATEGY_KEY,
	phase: 'pre' as const,

	init() {
		return strategy;
	},
}));

export const dropHitExpand = defineDropPlugin(
	(
		padding: {
			top?: SizeInput;
			left?: SizeInput;
			right?: SizeInput;
			bottom?: SizeInput;
		} = {},
	) => ({
		key: DROP_HIT_EXPAND_KEY,
		phase: 'pre' as const,

		init(ctx) {
			const node = ctx.rootNode;
			const resolve = (value: SizeInput | undefined, axis: 'width' | 'height') =>
				value != null ? resolveSizeInput(ctx.length, value, sizeContext(node, axis), 0) : 0;
			return {
				top: resolve(padding.top, 'height'),
				left: resolve(padding.left, 'width'),
				right: resolve(padding.right, 'width'),
				bottom: resolve(padding.bottom, 'height'),
			};
		},
	}),
);

export { DROP_HIT_EXPAND_KEY, COLLISION_PRIORITY_KEY, COLLISION_STRATEGY_KEY } from "./keys.ts";
