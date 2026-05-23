import { defineDragPlugin } from '../types.ts';
import { POSITION_KEY } from './keys.ts';

export type PositionOptions = {
	current?: { x: number; y: number } | null;
	default?: { x: number; y: number } | null;
};

function applyPosition(ctx: { isInteracting: boolean; offset: { x: number; y: number }; setForcedPosition: (x: number, y: number) => void }, opts: PositionOptions | null) {
	if (ctx.isInteracting) return;
	const x = opts?.current?.x ?? opts?.default?.x ?? ctx.offset.x;
	const y = opts?.current?.y ?? opts?.default?.y ?? ctx.offset.y;
	if (x !== ctx.offset.x || y !== ctx.offset.y) ctx.setForcedPosition(x, y);
}

export const position = defineDragPlugin((options: PositionOptions | null = null) => ({
	key: POSITION_KEY,
	name: 'position',
	phase: 'pre',

	init(ctx) {
		applyPosition(ctx, options);
		return { lastX: options?.current?.x, lastY: options?.current?.y };
	},

	update(ctx) {
		applyPosition(ctx, options);
	},

	drag(ctx, state) {
		if (options?.current) {
			state.lastX = options.current.x;
			state.lastY = options.current.y;
		}
	},
}));
