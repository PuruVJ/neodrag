import type { AuthoredSizePair, LengthAdapter } from '../length-runtime.ts';
import type { LengthResolveContext, SizeInput } from '../length-runtime.ts';
import { formatPx, readBoxSizePx } from './utils.ts';

const STUB_MSG =
	'Neodrag: CSS unit strings require `length: new Length()` on this Draggable/Resizable binding (import Length from @neodrag/core)';

export const numberStub: LengthAdapter = {
	units: 'px',

	resolvePx(value: SizeInput, _ctx: LengthResolveContext): number {
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) throw new Error('Neodrag: expected a finite size number');
			return value;
		}
		throw new Error(STUB_MSG);
	},

	readAuthoredPair(node: HTMLElement | SVGElement): AuthoredSizePair {
		const px = readBoxSizePx(node);
		return { width: formatPx(px.width), height: formatPx(px.height) };
	},

	commitAuthored(px: { width: number; height: number }, _preserve: AuthoredSizePair, _node: HTMLElement | SVGElement): AuthoredSizePair {
		return { width: formatPx(px.width), height: formatPx(px.height) };
	},

	cloneAuthored(pair: AuthoredSizePair): AuthoredSizePair {
		return { width: pair.width, height: pair.height };
	},
};
