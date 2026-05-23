export const clamp = (val: number, min: number, max: number) =>
	val < min ? min : val > max ? max : val;
