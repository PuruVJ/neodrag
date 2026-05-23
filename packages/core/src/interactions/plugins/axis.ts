import { defineDragPlugin } from '../types.ts';
import { AXIS_KEY } from './keys.ts';

export const axis = defineDragPlugin((value?: 'x' | 'y' | null) => ({
	key: AXIS_KEY,
	name: 'axis',
	phase: 'resolve',

	drag(ctx) {
		if (!value) return;
		if (value === 'x') return { y: 0 };
		return { x: 0 };
	},
}));
