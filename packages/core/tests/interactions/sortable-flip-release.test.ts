// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { applyTransformToNode, clearTransformOnNode } from '../../src/sortable/displacement/apply.ts';

describe('sortable transform displacement', () => {
	test('applyTransformToNode sets translate3d transform', () => {
		const el = document.createElement('div');
		applyTransformToNode(el, { x: 12, y: -4 });
		expect(el.style.transform).toMatch(/translate3d\(12px, -4px, 0(px)?\)/);
		expect(el.hasAttribute('data-neodrag-sortable-displaced')).toBe(true);
	});

	test('clearTransformOnNode removes transform', () => {
		const el = document.createElement('div');
		applyTransformToNode(el, { x: 1, y: 2 });
		clearTransformOnNode(el);
		expect(el.style.transform).toBe('');
		expect(el.hasAttribute('data-neodrag-sortable-displaced')).toBe(false);
	});
});
