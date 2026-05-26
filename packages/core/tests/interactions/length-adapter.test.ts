/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	Length,
	Neodrag,
	defineLengthAdapter,
	delegateLengthAdapter,
	numberStub,
	type LengthAdapter,
	type SizeInput,
} from '../../src/index.ts';
import { resizeHandles } from '../../src/resize/index.ts';

describe('length adapter', () => {
	let engine: Neodrag;

	beforeEach(() => {
		engine = new Neodrag({ plugins: [], dev: false });
	});

	afterEach(() => {
		engine.dispose();
	});

	it('numberStub rejects CSS strings', () => {
		const el = document.createElement('div');
		expect(() => numberStub.resolvePx('10rem', { element: el, axis: 'width' })).toThrow(
			/length: new Length\(\)/,
		);
	});

	it('defineLengthAdapter validates the contract', () => {
		const custom: LengthAdapter = defineLengthAdapter({
			units: 'px',
			resolvePx(value, ctx) {
				if (typeof value === 'number') return value;
				if (typeof value === 'string' && value === 'token') return 99;
				return new Length().resolvePx(value, ctx);
			},
			readAuthoredPair: (node) => new Length().readAuthoredPair(node),
			commitAuthored: (px, preserve, node) => new Length().commitAuthored(px, preserve, node),
			cloneAuthored: (pair) => ({ ...pair }),
		});
		const el = document.createElement('div');
		expect(custom.resolvePx('token' as SizeInput, { element: el, axis: 'width' })).toBe(99);
	});

	it('delegateLengthAdapter overrides resolvePx only', () => {
		const hybrid = delegateLengthAdapter(new Length(), {
			resolvePx(value, ctx) {
				if (typeof value === 'string' && value === 'magic') return 42;
				return new Length().resolvePx(value, ctx);
			},
		});
		const el = document.createElement('div');
		expect(hybrid.resolvePx('magic' as SizeInput, { element: el, axis: 'width' })).toBe(42);
		expect(hybrid.units).toBe('preserve');
	});

	it('length does not bleed between resizable registrations', () => {
		const a = document.createElement('div');
		const b = document.createElement('div');
		document.body.append(a, b);

		engine.resizable(a, [], { length: new Length() });
		engine.resizable(b, []);

		const ctx = { element: b, axis: 'width' as const };
		expect(() => numberStub.resolvePx('1rem', ctx)).toThrow(/length: new Length\(\)/);
		expect(new Length().resolvePx('1rem', { element: a, axis: 'width' })).toBe(16);
	});
});
