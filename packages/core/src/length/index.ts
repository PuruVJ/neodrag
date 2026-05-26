import type { AuthoredSizePair, LengthAdapter, LengthUnitsMode } from '../length-runtime.ts';
import type { LengthResolveContext, SizeInput } from '../length-runtime.ts';
import {
	formatPx,
	lengthContext,
	parseLengthString,
	pxToUnit,
	readAuthoredAxis,
	readBoxSizePx,
	resolveUnit,
	stripFloat,
	type CssUnit,
} from './utils.ts';

export type { CssUnit };
export {
	formatPx,
	lengthContext,
	parseLengthString,
	pxToUnit,
	readAuthoredAxis,
	readBoxSizePx,
	resolveUnit,
	stripFloat,
} from './utils.ts';
export { defineLengthAdapter, delegateLengthAdapter } from './adapter-helpers.ts';

export type LengthOptions = {
	units?: LengthUnitsMode;
};

function parseAuthoredCss(css: string, node: HTMLElement | SVGElement, axis: 'width' | 'height') {
	const { value, unit } = parseLengthString(css);
	return { value, unit, css: `${stripFloat(value)}${unit}` };
}

export class Length implements LengthAdapter {
	readonly units: LengthUnitsMode;

	constructor(options: LengthOptions = {}) {
		this.units = options.units ?? 'preserve';
	}

	static px(value: number): string {
		return formatPx(value);
	}

	static rem(value: number): string {
		return `${stripFloat(value)}rem`;
	}

	static em(value: number): string {
		return `${stripFloat(value)}em`;
	}

	static percent(value: number): string {
		return `${stripFloat(value)}%`;
	}

	resolvePx(value: SizeInput, ctx: LengthResolveContext): number {
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) throw new Error('Neodrag Length: expected a finite number');
			return value;
		}
		const { value: n, unit } = parseLengthString(value);
		return resolveUnit(n, unit, lengthContext(ctx.element, ctx.axis, ctx));
	}

	readAuthoredPair(node: HTMLElement | SVGElement): AuthoredSizePair {
		const px = readBoxSizePx(node);
		if (this.units === 'px') {
			return { width: formatPx(px.width), height: formatPx(px.height) };
		}
		const w =
			readAuthoredAxis(node, 'width') ??
			formatPx(px.width);
		const h =
			readAuthoredAxis(node, 'height') ??
			formatPx(px.height);
		return { width: w, height: h };
	}

	commitAuthored(
		px: { width: number; height: number },
		preserve: AuthoredSizePair,
		node: HTMLElement | SVGElement,
	): AuthoredSizePair {
		if (this.units === 'px') {
			return { width: formatPx(px.width), height: formatPx(px.height) };
		}
		const wParsed = parseAuthoredCss(preserve.width, node, 'width');
		const hParsed = parseAuthoredCss(preserve.height, node, 'height');
		const wCtx = lengthContext(node, 'width');
		const hCtx = lengthContext(node, 'height');
		const wVal = pxToUnit(px.width, wParsed.unit, wCtx);
		const hVal = pxToUnit(px.height, hParsed.unit, hCtx);
		return {
			width: `${stripFloat(wVal)}${wParsed.unit}`,
			height: `${stripFloat(hVal)}${hParsed.unit}`,
		};
	}

	cloneAuthored(pair: AuthoredSizePair): AuthoredSizePair {
		return { width: pair.width, height: pair.height };
	}
}

export const Unit = {
	px: (value: number) => formatPx(value),
	rem: (value: number) => `${stripFloat(value)}rem`,
	em: (value: number) => `${stripFloat(value)}em`,
	percent: (value: number) => `${stripFloat(value)}%`,
	ch: (value: number) => `${stripFloat(value)}ch`,
	ex: (value: number) => `${stripFloat(value)}ex`,
	vw: (value: number) => `${stripFloat(value)}vw`,
	vh: (value: number) => `${stripFloat(value)}vh`,
	vmin: (value: number) => `${stripFloat(value)}vmin`,
	vmax: (value: number) => `${stripFloat(value)}vmax`,
} as const;
