import { parse } from 'devalue';
import type { DragOptions } from '../../../../src';

export function load({ request }) {
	const url = new URL(request.url);

	const options_str = decodeURI(url.searchParams.get('options')!);
	const options: DragOptions = options_str ? parse(options_str) : {};

	return {
		options,
	};
}
