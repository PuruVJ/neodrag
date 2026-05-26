/**
 * CSS length units Neodrag can parse and resolve to pixels.
 * @see {@link CssLengthString} — TypeScript only allows a single `number + unit` pair (no `min()`, `max()`, or `clamp()`).
 */
export const CSS_LENGTH_UNITS = [
	'px',
	'%',
	'rem',
	'em',
	'ch',
	'ex',
	'vw',
	'vh',
	'vmin',
	'vmax',
	'svw',
	'svh',
	'lvw',
	'lvh',
	'dvw',
	'dvh',
] as const;

export type CssLengthUnit = (typeof CSS_LENGTH_UNITS)[number];

type SignedCssNumber = number | `-${number}`;

/**
 * A single CSS length: numeric token immediately followed by a {@link CssLengthUnit}.
 *
 * Valid: `'10px'`, `'1.5rem'`, `'-12px'`, `'92vw'`
 *
 * Not valid (runtime and types): `'min(92vw, 720px)'`, `'clamp(...)'`, `'1fr'`, `'auto'`, `'10 px'` (space).
 */
export type CssLengthString = `${SignedCssNumber}${CssLengthUnit}`;

/**
 * Plugin/binding size option: pixels as a number, or a typed {@link CssLengthString} when using `Length`.
 */
export type SizeInput = number | CssLengthString;

export function isCssLengthUnit(unit: string): unit is CssLengthUnit {
	return (CSS_LENGTH_UNITS as readonly string[]).includes(unit);
}
