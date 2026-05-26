import { CSS_LENGTH_UNITS, isCssLengthUnit, type CssLengthUnit } from '../length-types.ts';
import type { LengthAxis, LengthResolveContext } from '../length-runtime.ts';

export type { CssLengthString, CssLengthUnit, SizeInput } from '../length-types.ts';

export type CssUnit = CssLengthUnit;

const UNIT_ALTERNATION = CSS_LENGTH_UNITS.join('|');
const UNIT_PATTERN = new RegExp(`^(-?\\d*\\.?\\d+)(${UNIT_ALTERNATION})$`);

const UNSUPPORTED_UNITS = new Set<string>(['fr']);

export function stripFloat(n: number): string {
	if (Number.isInteger(n)) return String(n);
	return n.toFixed(4).replace(/\.?0+$/, '');
}

function parseCssUnit(unit: string): CssUnit {
	if (UNSUPPORTED_UNITS.has(unit)) {
		throw new Error(`Neodrag Length: unit "${unit}" is not supported`);
	}
	if (!isCssLengthUnit(unit)) {
		throw new Error(`Neodrag Length: unit "${unit}" is not supported`);
	}
	return unit;
}

export function parseLengthString(raw: string): { value: number; unit: CssUnit } {
	const trimmed = raw.trim();
	if (/-?\d*\.?\d+fr$/i.test(trimmed)) {
		parseCssUnit('fr');
	}
	const match = UNIT_PATTERN.exec(trimmed);
	if (!match) {
		throw new Error(`Neodrag Length: invalid length "${raw}"`);
	}
	return { value: Number.parseFloat(match[1]!), unit: parseCssUnit(match[2]!) };
}

function readRootFontSizePx(): number {
	const fs = getComputedStyle(document.documentElement).fontSize;
	const n = Number.parseFloat(fs);
	return Number.isFinite(n) && n > 0 ? n : 16;
}

function readElementFontSizePx(element: HTMLElement | SVGElement): number {
	if (!(element instanceof HTMLElement)) return readRootFontSizePx();
	const fs = getComputedStyle(element).fontSize;
	const n = Number.parseFloat(fs);
	return Number.isFinite(n) && n > 0 ? n : readRootFontSizePx();
}

function readParentRect(element: HTMLElement | SVGElement): DOMRect | undefined {
	const parent =
		element instanceof HTMLElement
			? element.offsetParent instanceof HTMLElement
				? element.offsetParent
				: element.parentElement
			: element.parentElement;
	if (!parent) return undefined;
	return parent.getBoundingClientRect();
}

export function lengthContext(
	element: HTMLElement | SVGElement,
	axis: LengthAxis,
	overrides: Partial<LengthResolveContext> = {},
): LengthResolveContext {
	return {
		element,
		axis,
		rootFontSizePx: overrides.rootFontSizePx ?? readRootFontSizePx(),
		fontSizePx: overrides.fontSizePx ?? readElementFontSizePx(element),
		parentRect: overrides.parentRect ?? readParentRect(element),
		...overrides,
	};
}

export function resolveUnit(value: number, unit: CssUnit, ctx: LengthResolveContext): number {
	switch (unit) {
		case 'px':
			return value;
		case 'rem':
			return value * (ctx.rootFontSizePx ?? readRootFontSizePx());
		case 'em':
		case 'ch':
		case 'ex':
			return value * (ctx.fontSizePx ?? readElementFontSizePx(ctx.element));
		case '%': {
			const parent = ctx.parentRect ?? readParentRect(ctx.element);
			if (!parent) return value;
			const base =
				ctx.axis === 'width' || ctx.axis === 'x' ? parent.width : parent.height;
			return (value / 100) * base;
		}
		case 'vw':
		case 'svw':
		case 'lvw':
		case 'dvw':
			return (value / 100) * window.innerWidth;
		case 'vh':
		case 'svh':
		case 'lvh':
		case 'dvh':
			return (value / 100) * window.innerHeight;
		case 'vmin':
			return (value / 100) * Math.min(window.innerWidth, window.innerHeight);
		case 'vmax':
			return (value / 100) * Math.max(window.innerWidth, window.innerHeight);
		default:
			return value;
	}
}

export function pxToUnit(px: number, unit: CssUnit, ctx: LengthResolveContext): number {
	if (unit === 'px') return px;
	let value = px;
	switch (unit) {
		case '%': {
			const parent = ctx.parentRect ?? readParentRect(ctx.element);
			const base =
				parent && (ctx.axis === 'width' || ctx.axis === 'x')
					? parent.width
					: parent
						? parent.height
						: 0;
			value = base > 0 ? (px / base) * 100 : px;
			break;
		}
		case 'rem':
			value = px / (ctx.rootFontSizePx ?? readRootFontSizePx());
			break;
		case 'em':
			value = px / (ctx.fontSizePx ?? readElementFontSizePx(ctx.element));
			break;
		case 'vw':
		case 'svw':
		case 'lvw':
		case 'dvw':
			value = window.innerWidth > 0 ? (px / window.innerWidth) * 100 : px;
			break;
		case 'vh':
		case 'svh':
		case 'lvh':
		case 'dvh':
			value = window.innerHeight > 0 ? (px / window.innerHeight) * 100 : px;
			break;
		case 'vmin': {
			const vmin = Math.min(window.innerWidth, window.innerHeight);
			value = vmin > 0 ? (px / vmin) * 100 : px;
			break;
		}
		case 'vmax': {
			const vmax = Math.max(window.innerWidth, window.innerHeight);
			value = vmax > 0 ? (px / vmax) * 100 : px;
			break;
		}
		default:
			return px;
	}
	return value;
}

const LENGTH_LIKE = /^-?\d*\.?\d+(px|%|rem|em|ch|ex|vw|vh|vmin|vmax|svw|svh|lvw|lvh|dvw|dvh)$/;

export function readAuthoredAxis(
	node: HTMLElement | SVGElement,
	axis: 'width' | 'height',
): string | null {
	if (!(node instanceof HTMLElement)) return null;
	const inline = axis === 'width' ? node.style.width : node.style.height;
	if (inline && LENGTH_LIKE.test(inline.trim())) return inline.trim();
	const computed = getComputedStyle(node)[axis];
	if (computed && LENGTH_LIKE.test(computed.trim())) return computed.trim();
	return null;
}

export function readBoxSizePx(node: HTMLElement | SVGElement): { width: number; height: number } {
	const rect = node.getBoundingClientRect();
	return { width: rect.width, height: rect.height };
}

export function formatPx(n: number): string {
	return `${stripFloat(n)}px`;
}
