import { parseTranslate } from './dom.ts';

export function assertTranslate(
	el: HTMLElement,
	expected: { x: number; y: number },
	tolerance = 0.5,
) {
	const { x, y } = parseTranslate(el);
	if (Math.abs(x - expected.x) > tolerance || Math.abs(y - expected.y) > tolerance) {
		throw new Error(
			`translate expected (${expected.x}, ${expected.y}) within ±${tolerance}, got (${x}, ${y})`,
		);
	}
}

export function assertOffset(
	instance: { offsetX: number; offsetY: number },
	expected: { x: number; y: number },
	tolerance = 0.5,
) {
	if (
		Math.abs(instance.offsetX - expected.x) > tolerance ||
		Math.abs(instance.offsetY - expected.y) > tolerance
	) {
		throw new Error(
			`offset expected (${expected.x}, ${expected.y}) within ±${tolerance}, got (${instance.offsetX}, ${instance.offsetY})`,
		);
	}
}
