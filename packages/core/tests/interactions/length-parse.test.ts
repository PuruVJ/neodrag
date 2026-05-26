/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Length } from '../../src/length/index.ts';
import { lengthContext, parseLengthString } from '../../src/length/utils.ts';

describe('length parse', () => {
	it('parses number as px', () => {
		const length = new Length();
		const ctx = lengthContext(document.createElement('div'), 'width');
		expect(length.resolvePx(120, ctx)).toBe(120);
	});

	it('parses string units', () => {
		const length = new Length();
		const ctx = lengthContext(document.createElement('div'), 'width');
		expect(parseLengthString('50%').unit).toBe('%');
		expect(parseLengthString('12rem').unit).toBe('rem');
		expect(parseLengthString('2em').unit).toBe('em');
		expect(length.resolvePx('50%', ctx)).toBeGreaterThanOrEqual(0);
	});

	it('rejects fr', () => {
		expect(() => parseLengthString('1fr')).toThrow(/not supported/);
	});
});

describe('length resolve', () => {
	it('resolves rem from root font size', () => {
		document.documentElement.style.fontSize = '20px';
		const length = new Length();
		const el = document.createElement('div');
		const ctx = lengthContext(el, 'width');
		expect(length.resolvePx('2rem', ctx)).toBe(40);
	});

	it('resolves % width against parent', () => {
		const parent = document.createElement('div');
		parent.style.width = '400px';
		parent.style.height = '200px';
		document.body.appendChild(parent);
		const child = document.createElement('div');
		parent.appendChild(child);
		Object.defineProperty(child, 'offsetParent', { value: parent, configurable: true });
		const length = new Length();
		const ctx = lengthContext(child, 'width', { parentRect: parent.getBoundingClientRect() });
		expect(length.resolvePx('50%', ctx)).toBeCloseTo(200, 0);
		parent.remove();
	});
});
