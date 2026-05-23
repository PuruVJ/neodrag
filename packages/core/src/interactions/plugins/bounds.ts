import { BoundsFrom, validateBounds, type BoundFromFunction } from '../lib/bounds-from.ts';
import { clamp } from '../lib/math.ts';
import { defineDragPlugin } from '../types.ts';
import { BOUNDS_KEY } from './keys.ts';

export { BoundsFrom };

type BoundsHook = 'init' | 'start' | 'drag' | 'end';

function recompute(
	value: BoundFromFunction,
	ctx: { rootNode: HTMLElement | SVGElement; cachedRootNodeRect: DOMRect },
) {
	const bounds = value({ rootNode: ctx.rootNode });
	validateBounds(bounds, ctx.cachedRootNodeRect.width, ctx.cachedRootNodeRect.height);
	return bounds;
}

export const bounds = defineDragPlugin(
	(
		value: BoundFromFunction = () => [
			[0, 0],
			[0, 0],
		],
		shouldRecompute: (ctx: { hook: BoundsHook }) => boolean = (ctx) => ctx.hook === 'start',
	) => ({
		key: BOUNDS_KEY,
		name: 'bounds',
		phase: 'resolve',

		init(ctx) {
			const boundsCoords = shouldRecompute({ hook: 'init' })
				? recompute(value, ctx)
				: ([
						[0, 0],
						[window.innerWidth, window.innerHeight],
					] as [[number, number], [number, number]]);
			return {
				bounds: boundsCoords,
				initialX: ctx.cachedRootNodeRect.left - ctx.offset.x,
				initialY: ctx.cachedRootNodeRect.top - ctx.offset.y,
			};
		},

		start(ctx, state) {
			if (!shouldRecompute({ hook: 'start' })) return;
			state.bounds = recompute(value, ctx);
			state.initialX = ctx.cachedRootNodeRect.left - ctx.offset.x;
			state.initialY = ctx.cachedRootNodeRect.top - ctx.offset.y;
		},

		drag(ctx, state) {
			if (!ctx.isDragging) return;
			if (shouldRecompute({ hook: 'drag' })) {
				state.bounds = recompute(value, ctx);
			}

			const w = ctx.cachedRootNodeRect.width;
			const h = ctx.cachedRootNodeRect.height;
			const b = state.bounds;
			const minOx = b[0][0] - state.initialX;
			const minOy = b[0][1] - state.initialY;
			const maxOx = b[1][0] - w - state.initialX;
			const maxOy = b[1][1] - h - state.initialY;
			const px = ctx.offset.x + ctx.proposed.x;
			const py = ctx.offset.y + ctx.proposed.y;

			return {
				x: clamp(px, minOx, maxOx) - ctx.offset.x,
				y: clamp(py, minOy, maxOy) - ctx.offset.y,
			};
		},

		end(ctx, state) {
			if (shouldRecompute({ hook: 'end' })) {
				state.bounds = recompute(value, ctx);
			}
		},
	}),
);
