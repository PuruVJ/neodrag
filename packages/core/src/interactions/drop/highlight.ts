import { defineDropPlugin } from '../types.ts';
import { HIGHLIGHT_KEY } from '../plugins/keys.ts';

export const highlight = defineDropPlugin(
	(options: { overClass?: string } = {}) => ({
		key: HIGHLIGHT_KEY,
		name: 'highlight',
		phase: 'post',

		init() {
			return { overClass: options.overClass ?? 'neodrag-drop-over' };
		},

		enter(ctx, state) {
			ctx.effect(() => ctx.rootNode.classList.add(state.overClass));
		},

		leave(ctx, state) {
			ctx.rootNode.classList.remove(state.overClass);
		},

		destroy(ctx, state) {
			ctx.rootNode.classList.remove(state.overClass);
		},
	}),
);
