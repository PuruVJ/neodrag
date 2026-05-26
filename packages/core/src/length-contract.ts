import { numberStub } from './length/number-stub.ts';
import type {
	LengthAdapter,
	LengthAxis,
	LengthResolveContext,
	SizeInput,
} from './length-runtime.ts';

export type {
	AuthoredSizePair,
	LengthAdapter,
	LengthAxis,
	LengthResolveContext,
	LengthUnitsMode,
	SizeInput,
} from './length-runtime.ts';

export { numberStub };

export function isLengthAdapter(value: unknown): value is LengthAdapter {
	if (typeof value !== 'object' || value === null) return false;
	const v = value as LengthAdapter;
	return (
		(v.units === 'preserve' || v.units === 'px') &&
		typeof v.resolvePx === 'function' &&
		typeof v.readAuthoredPair === 'function' &&
		typeof v.commitAuthored === 'function' &&
		typeof v.cloneAuthored === 'function'
	);
}

export function sizeContext(
	element: HTMLElement | SVGElement,
	axis: LengthAxis,
): LengthResolveContext {
	return { element, axis };
}

export function resolveSizeInput(
	adapter: LengthAdapter,
	value: SizeInput | undefined,
	ctx: LengthResolveContext,
	fallback: number,
): number {
	if (value === undefined) return fallback;
	return adapter.resolvePx(value, ctx);
}
