import { defineDragPlugin } from '../types.ts';
import { GRID_KEY } from './keys.ts';

const snap = (val: number, step: number) => (step === 0 ? 0 : Math.round(val / step) * step);

export const grid = defineDragPlugin(
	(values?: [x: number | null | undefined, y: number | null | undefined] | null) => ({
		key: GRID_KEY,
		name: 'grid',
		phase: 'resolve',

		drag(ctx) {
			if (!values) return;
			const patch: { x?: number; y?: number } = {};
			if (values[0]) patch.x = snap(ctx.proposed.x, values[0]);
			if (values[1]) patch.y = snap(ctx.proposed.y, values[1]);
			if (patch.x !== undefined || patch.y !== undefined) return patch;
		},
	}),
);
