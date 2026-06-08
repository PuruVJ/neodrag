// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { applyTransformToNode, clearTransformOnNode } from '../../src/sortable/displacement/apply.ts';

describe('sortable visual release (transform)', () => {
	test('instant apply bypasses CSS transition at drag start', () => {
		const el = document.createElement('div');
		el.style.transition = 'transform 220ms ease';
		applyTransformToNode(el, { x: 12, y: 0 }, { instant: true });
		expect(el.style.transform).toContain('translate3d');
		expect(el.style.transition).toBe('');
	});

	test('clear with instant does not wait for transitionend', () => {
		const el = document.createElement('div');
		applyTransformToNode(el, { x: 8, y: 0 });
		clearTransformOnNode(el, { instant: true });
		expect(el.style.transform).toBe('');
	});
});
