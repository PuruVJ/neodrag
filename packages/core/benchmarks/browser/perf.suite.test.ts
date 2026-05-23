/**
 * Chromium performance suite — real layout, compositor, and event pipeline.
 */
import { describe, expect, it } from 'vitest';
import { MINIMAL_DRAG_PLUGINS, Neodrag } from '../../src/index.ts';
import { sortable } from '../../src/interactions/sortable/index.ts';
import { transform } from '../../src/plugins.ts';
import {
	createBox,
	dragSteps,
	formatComparison,
	pointer,
	ratioLabel,
	resetBody,
	runBench,
	type BenchStats,
} from './helpers.ts';

const DRAG = { fromX: 120, fromY: 120, toX: 220, toY: 220, steps: 12 };
const SORTABLE_N = 40;

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

function setupSortable() {
	const container = document.createElement('ul');
	container.style.cssText = 'list-style:none;padding:0;margin:0;width:200px;position:absolute;left:40px;top:40px';
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

	const engine = new Neodrag({ plugins: [transform], dev: false });
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

describe('Chromium perf suite', () => {
	it('prints comparison table and enforces budgets', async () => {
		resetBody();
		const results: BenchStats[] = [];

		const box = createBox();
		const defaultEngine = new Neodrag({ dev: false });
		defaultEngine.draggable(box, []);

		results.push(
			runBench('steady-state · default plugins · 12-step drag', 300, 30, () => {
				dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
			}),
		);

		const minimalBox = createBox('100px', '240px');
		const minimalEngine = new Neodrag({ plugins: MINIMAL_DRAG_PLUGINS, dev: false });
		minimalEngine.draggable(minimalBox, []);

		results.push(
			runBench('steady-state · MINIMAL_DRAG_PLUGINS · 12-step drag', 300, 30, () => {
				dragSteps(minimalBox, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
			}),
		);

		results.push(
			runBench('idle · pointermove on draggable node', 2000, 200, () => {
				pointer(box, 'pointermove', 150, 150);
			}),
		);

		results.push(
			runBench('idle · pointermove on document (delegate)', 2000, 200, () => {
				pointer(document.documentElement, 'pointermove', 150, 150);
			}),
		);

		const microItems = Array.from({ length: SORTABLE_N }, (_, i) => ({ id: String(i + 1) }));
		const nodesByKey = new Map<string, HTMLElement>();
		const microRoot = document.createElement('div');
		microRoot.style.cssText = 'position:absolute;left:400px;top:40px';
		document.body.appendChild(microRoot);
		for (const item of microItems) {
			const el = document.createElement('div');
			el.setAttribute('data-sortable-key', item.id);
			el.style.cssText = 'height:32px;margin:2px 0';
			microRoot.appendChild(el);
			nodesByKey.set(item.id, el);
		}
		const pointerY = 200;

		results.push(
			runBench(`sortable index · querySelector × ${SORTABLE_N} items`, 200, 20, () => {
				for (let k = 0; k < 20; k++) computeIndexQuerySelector(microItems, pointerY, '1');
			}),
		);

		results.push(
			runBench(`sortable index · Map registry × ${SORTABLE_N} items`, 200, 20, () => {
				for (let k = 0; k < 20; k++) computeIndexMap(microItems, nodesByKey, pointerY, '1');
			}),
		);

		const { container, engine: sortEngine, first } = setupSortable();
		results.push(
			runBench(`sortable over · ${SORTABLE_N} items · dragging`, 200, 20, () => {
				for (let y = 30; y < 400; y += 6) {
					pointer(container, 'pointermove', 100, y);
				}
				pointer(first, 'pointermove', 100, 60);
			}),
		);
		sortEngine.dispose();

		const table = formatComparison(results);
		console.log('\n=== Neodrag — Chromium perf (real browser) ===\n');
		console.table(table);
		console.log('\nComparisons:');
		console.log(' ·', ratioLabel(results[1]!, results[0]!));
		console.log(' ·', ratioLabel(results[5]!, results[4]!));
		console.log('\nJSON:', JSON.stringify(results, null, 2));

		const defaultDrag = results[0]!;
		const minimalDrag = results[1]!;
		const legacyIndex = results[4]!;
		const mapIndex = results[5]!;

		expect(defaultDrag.medianMs).toBeLessThan(20);
		expect(minimalDrag.medianMs).toBeLessThan(20);
		expect(mapIndex.meanMs).toBeLessThan(legacyIndex.meanMs);

		const sortableOver = results[6]!;
		expect(sortableOver.meanMs).toBeLessThan(2.2);
		expect(sortableOver.p99Ms).toBeLessThan(10);

		defaultEngine.dispose();
		minimalEngine.dispose();
		box.remove();
		minimalBox.remove();
		microRoot.remove();
		container.remove();
	});
});
