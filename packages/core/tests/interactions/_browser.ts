import { programmaticToInput, type InteractionInput } from '../../src/interaction-input.ts';

/** A programmatic interaction event at `(x, y)` on `target` — the standard way the collab/seam
 * suites drive the engine without real pointer events. */
export function input(
	target: HTMLElement,
	phase: 'start' | 'move' | 'end',
	x: number,
	y: number,
): InteractionInput {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

/** Parse a CSS `translate` inline value into {x,y}px numbers (missing axis = 0).
 *
 * Real browsers normalise the `translate` shorthand on read-back — a trailing zero is
 * collapsed (`'20px 0px'` → `'20px'`, `'0px 0px'` → `'0px'` or `'none'`), so comparing the
 * serialized string is brittle and browser-specific. Parse to numbers and compare structurally. */
export function translate(node: Element): { x: number; y: number } {
	const v = (node as HTMLElement).style.translate;
	if (!v || v === 'none') return { x: 0, y: 0 };
	const [x, y] = v.split(/\s+/);
	return { x: parseFloat(x) || 0, y: parseFloat(y ?? '0') || 0 };
}

/**
 * Override a node's measured geometry so the capability math is deterministic across browsers.
 *
 * The interaction engine reads `getBoundingClientRect()` for the viewport rect AND `offsetWidth`/
 * `offsetHeight` (via `inverseScaleFromNode`) to detect a CSS-transform scale. jsdom reports
 * `offsetWidth === 0` (→ inverse-scale falls back to 1), but a real browser reports the element's
 * true layout width, which for an unsized test `<div>` is the container width — skewing the scale.
 * Pinning the offset box to the mocked rect keeps inverse-scale at 1 everywhere, so these stay the
 * pure unit tests they were written as. (Unlike a real CSS transform, we want NO scaling here.)
 */
export function mockRect(
	el: Element,
	rect: { left: number; top: number; right: number; bottom: number },
): void {
	const width = rect.right - rect.left;
	const height = rect.bottom - rect.top;
	el.getBoundingClientRect = () =>
		({ ...rect, width, height, x: rect.left, y: rect.top, toJSON() {} }) as DOMRect;
	Object.defineProperty(el, 'offsetWidth', { configurable: true, value: width });
	Object.defineProperty(el, 'offsetHeight', { configurable: true, value: height });
}

/** The effective inline `user-select` value, tolerant of WebKit. WebKit drops the unprefixed
 *  `user-select` from inline styles and only keeps `-webkit-user-select`, so read whichever the
 *  browser actually stored (they're set in lockstep by the code under test). */
export function userSelect(el: Element): string {
	const style = (el as HTMLElement).style;
	return style.getPropertyValue('user-select') || style.getPropertyValue('-webkit-user-select');
}
