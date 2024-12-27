import { extract_options_from_url } from '$lib/helpers.js';
import { z } from 'zod';

export function load({ request }) {
	const axis = extract_options_from_url(request, z.enum(['x', 'y']).optional());
	console.log({ axis });

	return { axis };
}
