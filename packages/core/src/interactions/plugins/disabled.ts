import { defineDragPlugin } from '../types.ts';
import { DISABLED_KEY } from './keys.ts';

export const disabled = defineDragPlugin((value = true) => ({
	key: DISABLED_KEY,
	name: 'disabled',
	phase: 'pre',

	start() {
		return !value;
	},
}));
