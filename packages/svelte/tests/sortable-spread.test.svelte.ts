import { describe, expect, test } from 'vitest';
import { NEODRAG_ATTACH_KEY } from '@neodrag/svelte';
import { Sortable } from '@neodrag/svelte/sortable';
import {
	SORTABLE_KEY_ATTR,
	SORTABLE_ROW_ATTR,
} from '@neodrag/core/sortable';

describe('@neodrag/svelte sortable spreads', () => {
	const list = new Sortable({
		items: () => [{ id: 'a' }],
		keyBy: (row) => row.id,
		onReorder: () => {},
	});

	test('row() merges SSR row attrs with row attach', () => {
		expect(list.row()[SORTABLE_ROW_ATTR]).toBe('');
		expect(list.row()[NEODRAG_ATTACH_KEY]).toBeTypeOf('function');
		expect(list.row()).not.toBe(list.row());
		expect(list.rowAttrs()).not.toBe(list.rowAttrs());
	});

	test('item() returns Draggable with chip attrs on target', () => {
		const chip = list.item('latte');
		expect(chip.target.draggable).toBe('false');
		expect(chip.target[SORTABLE_KEY_ATTR]).toBe('latte');
		expect(chip.target['data-neodrag-state']).toBe('idle');
		expect(chip.target[SORTABLE_ROW_ATTR]).toBeUndefined();
		expect(chip.target[NEODRAG_ATTACH_KEY]).toBeTypeOf('function');
		expect(chip.isDragging).toBe(false);
	});

	test('item() is stable per key', () => {
		expect(list.item('latte')).toBe(list.item('latte'));
		expect(list.item('latte')).not.toBe(list.item('cake'));
	});

	test('container carries attachment only', () => {
		const props = list.container;
		expect(props[NEODRAG_ATTACH_KEY]).toBeTypeOf('function');
		expect(props[SORTABLE_ROW_ATTR]).toBeUndefined();
		expect(list.container).toBe(list.container);
	});
});
