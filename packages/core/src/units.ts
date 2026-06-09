import type { DndNode } from './types.ts';

/**
 * CSS-length adapter — the px↔unit math, capability-agnostic and tree-shakeable. The core commits
 * geometry in `px` (exact); this lets a `use: []` plugin round-trip an authored unit (a `%`-box
 * stays `%`, a `rem`-box stays `rem`). Used by the resize `preserveUnits()` plugin, and public so
 * any custom drag/resize plugin can do unit-aware commits on whatever CSS length it writes.
 */
export type CssLengthUnit = 'px' | '%' | 'rem' | 'em' | 'ch' | 'ex' | 'vw' | 'vh' | 'vmin' | 'vmax';
export type LengthAxis = 'width' | 'height';

/** Anchored + linear (ReDoS-safe) matcher for a single `<number><unit>` length token. */
export const CSS_LENGTH_PATTERN = /^(-?\d*\.?\d+)(px|%|rem|em|ch|ex|vw|vh|vmin|vmax)$/;

export interface ParsedLength {
	value: number;
	unit: CssLengthUnit;
}

/** Compact length value — integers bare, floats trimmed to 4dp (`37.5`, not `37.5000`). */
export function formatLength(n: number): string {
	if (Number.isInteger(n)) return String(n);
	return n.toFixed(4).replace(/\.?0+$/, '');
}

/** Parse a single CSS length token (`'50%'`, `'12rem'`), or null if it isn't one. */
export function parseLength(raw: string): ParsedLength | null {
	const match = CSS_LENGTH_PATTERN.exec(raw.trim());
	if (!match) return null;
	return { value: Number.parseFloat(match[1]!), unit: match[2] as CssLengthUnit };
}

function rootFontSizePx(): number {
	const n = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
	return Number.isFinite(n) && n > 0 ? n : 16;
}

function elementFontSizePx(node: DndNode): number {
	if (!(node instanceof HTMLElement)) return rootFontSizePx();
	const n = Number.parseFloat(getComputedStyle(node).fontSize);
	return Number.isFinite(n) && n > 0 ? n : rootFontSizePx();
}

function parentRect(node: DndNode): DOMRect | undefined {
	const parent =
		node instanceof HTMLElement
			? node.offsetParent instanceof HTMLElement
				? node.offsetParent
				: node.parentElement
			: node.parentElement;
	return parent?.getBoundingClientRect();
}

/** Convert a px measurement into `unit` for the given axis (`%` is parent-relative). */
export function pxToUnit(px: number, unit: CssLengthUnit, axis: LengthAxis, node: DndNode): number {
	switch (unit) {
		case 'px':
			return px;
		case '%': {
			const parent = parentRect(node);
			const base = parent ? (axis === 'width' ? parent.width : parent.height) : 0;
			return base > 0 ? (px / base) * 100 : px;
		}
		case 'rem':
			return px / rootFontSizePx();
		case 'em':
		case 'ch':
		case 'ex':
			return px / elementFontSizePx(node);
		case 'vw':
			return window.innerWidth > 0 ? (px / window.innerWidth) * 100 : px;
		case 'vh':
			return window.innerHeight > 0 ? (px / window.innerHeight) * 100 : px;
		case 'vmin': {
			const v = Math.min(window.innerWidth, window.innerHeight);
			return v > 0 ? (px / v) * 100 : px;
		}
		case 'vmax': {
			const v = Math.max(window.innerWidth, window.innerHeight);
			return v > 0 ? (px / v) * 100 : px;
		}
	}
}

/** The authored inline (then computed) length on an axis, if it's a single length token. */
export function readAuthoredAxis(node: DndNode, axis: LengthAxis): string | null {
	if (!(node instanceof HTMLElement)) return null;
	const inline = axis === 'width' ? node.style.width : node.style.height;
	if (inline && CSS_LENGTH_PATTERN.test(inline.trim())) return inline.trim();
	const computed = getComputedStyle(node)[axis];
	if (computed && CSS_LENGTH_PATTERN.test(computed.trim())) return computed.trim();
	return null;
}

/** `px` re-expressed in `authored`'s unit, formatted (`'37.5%'`), or null if `authored` isn't a
 * length token. One-call helper for unit-preserving commits. */
export function pxToAuthored(px: number, authored: string, axis: LengthAxis, node: DndNode): string | null {
	const parsed = parseLength(authored);
	if (!parsed) return null;
	return `${formatLength(pxToUnit(px, parsed.unit, axis, node))}${parsed.unit}`;
}
