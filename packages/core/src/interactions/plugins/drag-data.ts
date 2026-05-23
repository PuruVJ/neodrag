import { defineDragPlugin } from '../types.ts';
import { DRAG_DATA_KEY } from './keys.ts';

export const dragData = defineDragPlugin(<T,>(getData: () => T) => ({
	key: DRAG_DATA_KEY,
	name: 'dragData',
	phase: 'pre',

	start(ctx) {
		ctx.session.data = getData();
	},
}));
