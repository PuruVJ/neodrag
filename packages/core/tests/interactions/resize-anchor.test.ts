import { describe, expect, it } from 'vitest';
import { sizeFromPointer } from '../../src/resize-session.ts';

describe('sizeFromPointer', () => {
	it('expands east edge with pointer moving right', () => {
		const { width, height } = sizeFromPointer('e', 100, 100, 200, 100, 150, 100, 1);
		expect(width).toBe(250);
		expect(height).toBe(100);
	});

	it('expands west edge when pointer moves left', () => {
		const { width } = sizeFromPointer('w', 300, 100, 200, 100, 250, 100, 1);
		expect(width).toBe(250);
	});

	it('expands south-east corner', () => {
		const { width, height } = sizeFromPointer('se', 0, 0, 100, 50, 40, 30, 1);
		expect(width).toBe(140);
		expect(height).toBe(80);
	});
});
