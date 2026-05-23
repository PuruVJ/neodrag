/**
 * @vitest-environment jsdom
 * Measures sortable index computation and full `over` path.
 */
import { bench, describe } from 'vitest';
import { Neodrag, sortable, transform } from '../src/index.ts';
import { resetBody } from './helpers/dom.ts';

const N = 40;

function buildSortableDom() {
	const items = Array.from({ length: N }, (_, i) => ({ id: String(i + 1) }));
	const nodesByKey = new Map<string, HTMLElement>();
	const container = document.createElement('div');
	document.body.appendChild(container);
	for (const item of items) {
		const el = document.createElement('div');
		el.setAttribute('data-sortable-key', item.id);
		el.style.cssText = 'height:32px;margin:2px 0';
		container.appendChild(el);
		nodesByKey.set(item.id, el);
	}
	return { items, nodesByKey, pointerY: 200, strategy: 'vertical' as const };
}

function computeIndexQuerySelector(
	items: { id: string }[],
	pointerY: number,
	excludeKey: string,
) {
	let index = items.length;
	for (let i = 0; i < items.length; i++) {
		const key = items[i]!.id;
		if (key === excludeKey) continue;
		const el = document.querySelector(`[data-sortable-key="${key}"]`);
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		const mid = rect.top + rect.height / 2;
		if (pointerY < mid) {
			index = i;
			break;
		}
	}
	return index;
}

function computeIndexMap(
	items: { id: string }[],
	nodesByKey: Map<string, HTMLElement>,
	pointerY: number,
	excludeKey: string,
) {
	let index = items.length;
	for (let i = 0; i < items.length; i++) {
		const key = items[i]!.id;
		if (key === excludeKey) continue;
		const el = nodesByKey.get(key);
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		const mid = rect.top + rect.height / 2;
		if (pointerY < mid) {
			index = i;
			break;
		}
	}
	return index;
}

function setupSortableList() {
	resetBody();
	const container = document.createElement('ul');
	container.style.cssText = 'list-style:none;padding:0;margin:0;width:200px';
	document.body.appendChild(container);

	const items = Array.from({ length: N }, (_, i) => ({ id: String(i + 1) }));
	for (const item of items) {
		const li = document.createElement('li');
		li.setAttribute('data-sortable-key', item.id);
		li.style.cssText = 'padding:12px;margin:4px 0;height:24px;background:#b8e0ff';
		li.textContent = item.id;
		container.appendChild(li);
	}

	const list = sortable({
		items: () => items,
		keyBy: (i) => i.id,
		onReorder: () => {},
		strategy: 'vertical',
	});

	const engine = new Neodrag({ plugins: [transform] });
	const dropHandle = engine.droppable(container, list.container());
	const dragHandles = items.map((item) => {
		const el = container.querySelector(`[data-sortable-key="${item.id}"]`) as HTMLElement;
		return engine.draggable(el, list.item(item.id));
	});

	return { container, engine, dropHandle, dragHandles, items };
}

function simulateOver(container: HTMLElement, clientY: number) {
	container.dispatchEvent(
		new PointerEvent('pointermove', {
			bubbles: true,
			clientX: 100,
			clientY,
			pointerId: 1,
			pointerType: 'mouse',
		}),
	);
}

describe(`sortable index micro (${N} items)`, () => {
	const { items, nodesByKey, pointerY } = buildSortableDom();

	bench(
		'querySelector loop (legacy)',
		() => {
			for (let k = 0; k < 50; k++) computeIndexQuerySelector(items, pointerY, '1');
		},
		{ iterations: 300, warmupIterations: 30 },
	);

	bench(
		'Map node registry',
		() => {
			for (let k = 0; k < 50; k++) computeIndexMap(items, nodesByKey, pointerY, '1');
		},
		{ iterations: 300, warmupIterations: 30 },
	);
});

describe(`sortable over (${N} items)`, () => {
	const ctx = setupSortableList();
	const first = ctx.container.querySelector('[data-sortable-key="1"]') as HTMLElement;

	first.dispatchEvent(
		new PointerEvent('pointerdown', {
			bubbles: true,
			clientX: 100,
			clientY: 20,
			pointerId: 1,
			pointerType: 'mouse',
			button: 0,
		}),
	);

	for (let y = 25; y < 200; y += 8) {
		simulateOver(ctx.container, y);
	}

	bench(
		'pointermove over sortable while dragging',
		() => {
			for (let y = 30; y < 400; y += 6) {
				simulateOver(ctx.container, y);
			}
		},
		{ iterations: 200, warmupIterations: 20 },
	);
});
