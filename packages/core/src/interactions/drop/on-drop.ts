import type { DropCtx } from '../types.ts';
import { defineDropPlugin } from '../types.ts';
import { ON_DROP_KEY } from '../plugins/keys.ts';

export const onDrop = defineDropPlugin(<T,>(handler: (data: T, ctx: DropCtx) => void) => ({
	key: ON_DROP_KEY,
	name: 'onDrop',
	phase: 'post',

	drop(ctx) {
		handler(ctx.session.data as T, ctx);
	},
}));
