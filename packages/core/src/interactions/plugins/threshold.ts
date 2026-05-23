import { is_null } from '../../utils.ts';
import { defineDragPlugin } from '../types.ts';
import { THRESHOLD_KEY } from './keys.ts';

export const threshold = defineDragPlugin((options?: { delay?: number; distance?: number } | null) => {
	const enabled = !is_null(options);
	const resolved = enabled
		? {
				delay: options?.delay ?? 0,
				distance: options?.distance ?? 3,
			}
		: null;

	if (resolved) {
		if (resolved.delay < 0) throw new Error('delay must be >= 0');
		if (resolved.distance < 0) throw new Error('distance must be >= 0');
	}

	return {
		key: THRESHOLD_KEY,
		name: 'threshold',
		phase: 'pre' as const,

		init() {
			return {
				enabled,
				started: false,
				start_time: 0,
				start_x: 0,
				start_y: 0,
				options: resolved,
			};
		},

		start(ctx, state, event) {
			if (!state.enabled) return true;
			if (ctx.isDragging) return true;

			if (!state.started) {
				state.started = true;
				state.start_time = Date.now();
				state.start_x = event.clientX;
				state.start_y = event.clientY;
			}

			if (state.options?.delay) {
				if (Date.now() - state.start_time < state.options.delay) return false;
			}

			if (state.options?.distance) {
				const dx = event.clientX - state.start_x;
				const dy = event.clientY - state.start_y;
				if (dx * dx + dy * dy <= state.options.distance ** 2) return false;
			}

			return true;
		},

		drag(ctx, state, event) {
			if (!state.enabled || ctx.isDragging) return;

			if (!ctx.rootNode.contains(event.target as Node)) {
				ctx.cancel();
			}
		},

		end(_ctx, state) {
			state.started = false;
		},
	};
});
