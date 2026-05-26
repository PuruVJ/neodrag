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

export type CssLengthString = `${SignedCssNumber}${CssLengthUnit}`;

export type SizeInput = number | CssLengthString;

export function isCssLengthUnit(unit: string): unit is CssLengthUnit {
	return (CSS_LENGTH_UNITS as readonly string[]).includes(unit);
}
