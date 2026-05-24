/**
 * Focused sortable-over benchmark with CI budget.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { sortable } from '../../src/drop/index.ts';

import { pointer, resetBody, runBench } from './helpers.ts';

const SORTABLE_N = 40;

function setupSortableDrag() {
	const container = document.createElement('ul');
	container.style.cssText =
		'list-style:none;padding:0;margin:0;width:200px;position:absolute;left:40px;top:40px';
	document.body.appendChild(container);

	const items = Array.from({ length: SORTABLE_N }, (_, i) => ({ id: String(i + 1) }));
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

	const engine = new Neodrag({ plugins: [], dev: false });
	engine.droppable(container, list.container());
	for (const item of items) {
		const el = container.querySelector(`[data-sortable-key="${item.id}"]`) as HTMLElement;
		engine.draggable(el, list.item(item.id));
	}

	const first = container.querySelector('[data-sortable-key="1"]') as HTMLElement;
	pointer(first, 'pointerdown', 100, 60);
	for (let y = 65; y < 200; y += 8) {
		pointer(container, 'pointermove', 100, y);
	}

	return { container, engine, first };
}

describe('sortable drag perf', () => {
	it('40-item sortable over stays under budget', async () => {
		resetBody();
		const { container, engine } = setupSortableDrag();

		const stats = runBench('sortable-over · 40 · drag path', 200, 20, () => {
			for (let y = 30; y < 400; y += 6) {
				pointer(container, 'pointermove', 100, y);
			}
		});

		expect(stats.meanMs).toBeLessThan(2);
		expect(stats.medianMs).toBeLessThan(1.8);
		expect(stats.p99Ms).toBeLessThan(8);

		engine.dispose();
		container.remove();
	});
});
