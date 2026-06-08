import { describe, expect, test } from 'vitest';
import {
	applyDragMarkupDragging,
	applyDragMarkupEnd,
	applyDragMarkupIdle,
	DRAG_MARKUP_COUNT,
	DRAG_MARKUP_STATE,
	dragStateMarkupAttrs,
} from '../../src/drag-markup.ts';
import { createDomMarkupAdapter as createAdapter } from '../../src/markup-adapter.ts';

describe('drag-markup', () => {
	test('dragStateMarkupAttrs seeds idle state', () => {
		expect(dragStateMarkupAttrs(2)).toEqual({
			'data-neodrag': '',
			'data-neodrag-state': 'idle',
			'data-neodrag-count': '2',
		});
	});

	test('dom adapter applies lifecycle attrs', () => {
		const node = document.createElement('div');
		const adapter = createAdapter(node);
		applyDragMarkupIdle(adapter, node, 0);
		expect(node.getAttribute(DRAG_MARKUP_STATE)).toBe('idle');
		expect(node.getAttribute(DRAG_MARKUP_COUNT)).toBe('0');
		applyDragMarkupDragging(adapter, node);
		expect(node.getAttribute(DRAG_MARKUP_STATE)).toBe('dragging');
		applyDragMarkupEnd(adapter, node, 1);
		expect(node.getAttribute(DRAG_MARKUP_STATE)).toBe('idle');
		expect(node.getAttribute(DRAG_MARKUP_COUNT)).toBe('1');
	});
});
