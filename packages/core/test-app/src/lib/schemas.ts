import { z } from 'zod';

export const SCHEMAS = {
	PLUGINS: {
		AXIS: z.enum(['x', 'y']).optional(),
		BOUNDS: z.object({
			type: z.enum(['parent', 'element', 'viewport', 'selector']),
			selector: z.string().optional(),
			padding: z
				.object({
					top: z.number().optional(),
					right: z.number().optional(),
					bottom: z.number().optional(),
					left: z.number().optional(),
				})
				.optional(),
			is_smaller_than_element: z.boolean().optional(),
		}),
		APPLY_USER_SELECT_HACK: z.boolean(),
	},
};
