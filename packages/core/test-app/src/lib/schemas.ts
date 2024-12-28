import { z } from 'zod';

export const SCHEMAS = {
	PLUGINS: {
		AXIS: z.enum(['x', 'y']).optional(),
	},
};
