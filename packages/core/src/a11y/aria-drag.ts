import { isKeyboardInput } from '../interaction-input.ts';
import { defineDragPlugin } from '../types.ts';

export const ARIA_DRAG_KEY = Symbol('neodrag.ariaDrag');

export type AriaDragAnnounce = boolean | {
	grab?: boolean;
	move?: boolean;
	drop?: boolean;
	cancel?: boolean;
};

export type AriaDragOptions = {
	role?: string;
	label?: string;
	liveRegion?: () => HTMLElement | null;
	announce?: AriaDragAnnounce;
};

function resolveAnnounce(
	announce: AriaDragAnnounce | undefined,
	key: keyof NonNullable<Exclude<AriaDragAnnounce, boolean>>,
): boolean {
	if (announce === undefined) return true;
	if (typeof announce === 'boolean') return announce;
	return announce[key] ?? true;
}

export const ariaDrag = defineDragPlugin((options: AriaDragOptions | null = {}) => {
	const role = options?.role ?? 'button';
	const label = options?.label ?? 'Draggable';
	const announce = options?.announce;

	return {
		key: ARIA_DRAG_KEY,

		init(ctx) {
			const node = ctx.rootNode as HTMLElement;
			node.setAttribute('tabindex', '0');
			node.setAttribute('role', role);
			node.setAttribute('aria-label', label);
			const liveRegion = options?.liveRegion?.() ?? null;

			const speak = (message: string) => {
				if (!liveRegion) return;
				liveRegion.textContent = message;
			};

			return { liveRegion, speak };
		},

		start(ctx, state, input) {
			if (!isKeyboardInput(input)) return;
			const node = ctx.rootNode as HTMLElement;
			node.setAttribute('aria-grabbed', 'true');
			if (resolveAnnounce(announce, 'grab')) state.speak('Grabbed');
		},

		drag(ctx, state, input) {
			if (!isKeyboardInput(input) || !resolveAnnounce(announce, 'move')) return;
			state.speak(`Position ${Math.round(ctx.offset.x)}, ${Math.round(ctx.offset.y)}`);
		},

		end(ctx, state, input, reason) {
			const node = ctx.rootNode as HTMLElement;
			node.setAttribute('aria-grabbed', 'false');
			if (!isKeyboardInput(input)) return;
			if (reason === 'cancel' && resolveAnnounce(announce, 'cancel')) {
				state.speak('Cancelled');
			} else if (reason === 'drop' && resolveAnnounce(announce, 'drop')) {
				state.speak('Dropped');
			} else if (resolveAnnounce(announce, 'drop')) {
				state.speak('Released');
			}
		},

		destroy(ctx) {
			const node = ctx.rootNode as HTMLElement;
			node.removeAttribute('aria-grabbed');
		},
	};
});
