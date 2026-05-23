import { defineDropPlugin } from '../types.ts';
import { ACCEPTS_KEY } from '../plugins/keys.ts';

export const accepts = defineDropPlugin(
	<T,>(predicate: (data: T) => boolean) => ({
		key: ACCEPTS_KEY,
		name: 'accepts',
		phase: 'pre',

		enter(ctx) {
			const data = ctx.session.data as T;
			if (!predicate(data)) return false;
		},
	}),
);
