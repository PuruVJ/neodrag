export type { CssLengthString, CssLengthUnit, SizeInput } from './length-types.ts';
export { CSS_LENGTH_UNITS, isCssLengthUnit } from './length-types.ts';

export type LengthAxis = 'width' | 'height' | 'x' | 'y';

export interface LengthResolveContext {
	element: HTMLElement | SVGElement;
	axis: LengthAxis;
	parentRect?: DOMRect;
	fontSizePx?: number;
	rootFontSizePx?: number;
}

export type LengthUnitsMode = 'preserve' | 'px';

export type AuthoredSizePair = {
	width: string;
	height: string;
};

export interface LengthAdapter {
	readonly units: LengthUnitsMode;
	resolvePx(value: SizeInput, ctx: LengthResolveContext): number;
	readAuthoredPair(node: HTMLElement | SVGElement): AuthoredSizePair;
	commitAuthored(
		px: { width: number; height: number },
		preserve: AuthoredSizePair,
		node: HTMLElement | SVGElement,
	): AuthoredSizePair;
	cloneAuthored(pair: AuthoredSizePair): AuthoredSizePair;
}
