import { defineDragPlugin } from '../types.ts';
import { GHOST_KEY } from './keys.ts';

export const ghost = defineDragPlugin((options: { opacity?: number } = {}) => ({
	key: GHOST_KEY,
	name: 'ghost',
	phase: 'pre',

	init() {
		return {
			ghostElement: null as HTMLElement | SVGElement | null,
		};
	},

	start(ctx, state) {
		const clone = ctx.rootNode.cloneNode(true) as HTMLElement | SVGElement;
		const rect = ctx.rootNode.getBoundingClientRect();
		state.ghostElement = clone;

		clone.classList.add('neodrag-ghost');
		(clone as HTMLElement).style.opacity = String(options.opacity ?? 0.5);
		clone.style.position = 'fixed';
		clone.style.pointerEvents = 'none';
		clone.style.zIndex = '9999';
		clone.style.margin = '0';
		clone.style.top = `${rect.top}px`;
		clone.style.left = `${rect.left}px`;
		clone.style.width = `${rect.width}px`;
		clone.style.height = `${rect.height}px`;
		clone.style.transform = '';
		(clone as HTMLElement).style.translate = '';

		document.body.appendChild(clone);
		ctx.setVisual(clone);
	},

	end(_ctx, state) {
		state.ghostElement?.remove();
		state.ghostElement = null;
	},

	destroy(ctx, state) {
		state.ghostElement?.remove();
		state.ghostElement = null;
		ctx.setVisual(ctx.rootNode);
	},
}));
