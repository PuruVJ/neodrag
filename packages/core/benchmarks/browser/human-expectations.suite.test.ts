/**
 * End-to-end behavioral suite: "does it work like a human would expect?"
 * Runs in real Chromium (Playwright provider) via test:bench:guard / test:human.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULTS, Neodrag } from '../../src/index.ts';
import { BoundsFrom, axis, bounds, disabled } from '../../src/plugins.ts';
import { accepts, highlight, onDrop } from '../../src/drop-plugins.ts';
import { dragData } from '../../src/plugins.ts';
import { Sortable } from '../../src/sortable/index.ts';
import {
	assertTranslate,
	createBox,
	dragElementByDelta,
	dragSteps,
	flushEffects,
	parseTranslate,
	pointer,
	resetBody,
} from './helpers.ts';

const DRAG = {
	fromX: 120,
	fromY: 120,
	toX: 220,
	toY: 220,
	steps: 16,
	expected: { x: 100, y: 100 },
};

describe('Human expectations (Chromium)', () => {
	describe('drag', () => {
		it('moves the element by the pointer delta', async () => {
			resetBody();
			const box = createBox();
			const engine = new Neodrag({ dev: false });
			const handle = engine.draggable(box, []);
			dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
			await flushEffects();
			assertTranslate(box, DRAG.expected);
			handle.destroy();
			engine.dispose();
		});

		it('does not move when disabled', async () => {
			resetBody();
			const box = createBox();
			const engine = new Neodrag({ dev: false });
			engine.draggable(box, [disabled()], { threshold: null });
			dragElementByDelta(box, 80, 80, 8);
			await flushEffects();
			const { x, y } = parseTranslate(box);
			expect(Math.abs(x)).toBeLessThan(1);
			expect(Math.abs(y)).toBeLessThan(1);
			engine.dispose();
		});

		it('locks movement to one axis when configured', async () => {
			resetBody();
			const box = createBox();
			const engine = new Neodrag({ dev: false });
			engine.draggable(box, [axis('x')], { threshold: null });
			dragElementByDelta(box, 60, 60, 10);
			await flushEffects();
			assertTranslate(box, { x: 60, y: 0 }, 4);
			engine.dispose();
		});

		it('stays inside parent bounds', async () => {
			resetBody();
			const parent = document.createElement('div');
			parent.style.cssText =
				'position:relative;width:200px;height:200px;overflow:hidden;margin:40px';
			const box = createBox('10px', '10px');
			parent.appendChild(box);
			document.body.appendChild(parent);

			const engine = new Neodrag({ dev: false });
			engine.draggable(box, [bounds(BoundsFrom.parent())], { threshold: null });
			dragElementByDelta(box, 400, 400, 10);
			await flushEffects();

			const { x, y } = parseTranslate(box);
			expect(x).toBeLessThanOrEqual(120);
			expect(y).toBeLessThanOrEqual(120);
			engine.dispose();
			parent.remove();
		});
	});

	describe('drop', () => {
		it('calls onDrop exactly once when released over a matching zone', async () => {
			resetBody();
			const drops: string[] = [];
			const zone = document.createElement('div');
			zone.style.cssText =
				'position:absolute;left:40px;top:40px;width:300px;height:300px;border:1px dashed #333';
			const box = createBox('80px', '80px');
			zone.appendChild(box);
			document.body.appendChild(zone);

			const engine = new Neodrag({ dev: false });
			engine.droppable(zone, [
				accepts<{ kind: string }>((d) => d.kind === 'card'),
				onDrop((d) => drops.push(d.kind)),
			]);
			engine.draggable(box, [dragData(() => ({ kind: 'card' }))], { threshold: null });

			const zr = zone.getBoundingClientRect();
			const br = box.getBoundingClientRect();
			dragSteps(
				box,
				br.left + br.width / 2,
				br.top + br.height / 2,
				zr.left + zr.width / 2,
				zr.top + zr.height / 2,
				12,
			);
			await flushEffects();

			expect(drops).toEqual(['card']);
			engine.dispose();
			zone.remove();
		});

		it('does not drop when released outside the zone', async () => {
			resetBody();
			const drops: string[] = [];
			const zone = document.createElement('div');
			zone.style.cssText =
				'position:absolute;left:280px;top:280px;width:120px;height:120px;border:1px dashed #333';
			const box = createBox('40px', '40px');
			document.body.append(zone, box);

			const engine = new Neodrag({ dev: false });
			engine.droppable(zone, [onDrop(() => drops.push('dropped'))]);
			engine.draggable(box, [], { threshold: null });

			const br = box.getBoundingClientRect();
			const zr = zone.getBoundingClientRect();
			dragSteps(box, br.left + br.width / 2, br.top + br.height / 2, zr.left - 30, zr.top - 30, 14);
			await flushEffects();

			expect(drops.length).toBe(0);
			engine.dispose();
			zone.remove();
			box.remove();
		});

		it('rejects payload when accepts returns false', async () => {
			resetBody();
			const drops: string[] = [];
			const zone = document.createElement('div');
			zone.style.cssText =
				'position:absolute;left:40px;top:40px;width:300px;height:300px;border:1px dashed #333';
			const box = createBox('80px', '80px');
			zone.appendChild(box);
			document.body.appendChild(zone);

			const engine = new Neodrag({ dev: false });
			engine.droppable(zone, [
				accepts<{ kind: string }>((d) => d.kind === 'allowed'),
				onDrop((d) => drops.push(d.kind)),
			]);
			engine.draggable(box, [dragData(() => ({ kind: 'blocked' }))], { threshold: null });

			const zr = zone.getBoundingClientRect();
			const br = box.getBoundingClientRect();
			dragSteps(
				box,
				br.left + br.width / 2,
				br.top + br.height / 2,
				zr.left + zr.width / 2,
				zr.top + zr.height / 2,
				12,
			);
			await flushEffects();

			expect(drops.length).toBe(0);
			engine.dispose();
			zone.remove();
		});

		it('highlights the zone while the pointer is over it during drag', async () => {
			resetBody();
			const zone = document.createElement('div');
			zone.style.cssText =
				'position:absolute;left:40px;top:40px;width:300px;height:300px;border:1px solid #333';
			const box = createBox('80px', '80px');
			zone.appendChild(box);
			document.body.appendChild(zone);

			const engine = new Neodrag({ dev: false });
			engine.droppable(zone, [highlight({ overClass: 'drop-over' })]);
			engine.draggable(box, [], { threshold: null });

			const zr = zone.getBoundingClientRect();
			const br = box.getBoundingClientRect();
			const startX = br.left + br.width / 2;
			const startY = br.top + br.height / 2;
			const overX = zr.left + zr.width / 2;
			const overY = zr.top + zr.height / 2;

			pointer(box, 'pointerdown', startX, startY);
			pointer(box, 'pointermove', overX, overY);
			await flushEffects();

			expect(zone.classList.contains('drop-over')).toBe(true);

			pointer(box, 'pointerup', overX, overY);
			await flushEffects();
			expect(zone.classList.contains('drop-over')).toBe(false);

			engine.dispose();
			zone.remove();
		});
	});

	describe('sortable', () => {
		function setupSortableList() {
			const items = [
				{ id: '1', text: 'One' },
				{ id: '2', text: 'Two' },
				{ id: '3', text: 'Three' },
			];
			const container = document.createElement('ul');
			container.style.cssText =
				'list-style:none;padding:0;margin:0;width:200px;position:absolute;left:40px;top:40px';
			for (const item of items) {
				const li = document.createElement('li');
				li.setAttribute('data-sortable-key', item.id);
				li.textContent = item.text;
				li.style.cssText = 'padding:12px;margin:4px 0;height:28px;background:#b8e0ff';
				container.appendChild(li);
			}
			document.body.appendChild(container);

			const list = new Sortable({
				items: () => items,
				keyBy: (i) => i.id,
				onReorder: (next) => {
					items.length = 0;
					items.push(...next);
				},
				strategy: 'vertical',
			});

			const engine = new Neodrag({ dev: false });
			engine.droppable(container, list.container());
			for (const item of items) {
				const el = container.querySelector(`[data-sortable-key="${item.id}"]`) as HTMLElement;
				engine.draggable(el, list.item(item.id), { threshold: null });
			}

			return { items, container, engine };
		}

		it('reorders data when dragging past another item', async () => {
			resetBody();
			const { items, container, engine } = setupSortableList();
			const first = container.querySelector('[data-sortable-key="1"]') as HTMLElement;
			const third = container.querySelector('[data-sortable-key="3"]') as HTMLElement;
			const r1 = first.getBoundingClientRect();
			const r3 = third.getBoundingClientRect();

			const before = items.map((i) => i.id);
			dragSteps(
				first,
				r1.left + r1.width / 2,
				r1.top + r1.height / 2,
				r3.left + r3.width / 2,
				r3.top + r3.height + 8,
				16,
			);
			await flushEffects();

			const after = items.map((i) => i.id);
			expect(after).not.toEqual(before);
			expect(after.sort().join()).toBe(before.sort().join());

			engine.dispose();
			container.remove();
		});

		it('does not reorder on a tiny nudge within the same slot', async () => {
			resetBody();
			const { items, container, engine } = setupSortableList();
			const first = container.querySelector('[data-sortable-key="1"]') as HTMLElement;
			const before = items.map((i) => i.id);

			dragElementByDelta(first, 2, 2, 3);
			await flushEffects();

			expect(items.map((i) => i.id)).toEqual(before);
			engine.dispose();
			container.remove();
		});
	});

	describe('engine sharing', () => {
		it('runs two draggables on one engine with consistent motion', async () => {
			resetBody();
			const a = createBox('100px', '100px');
			const b = createBox('300px', '100px');
			const engine = new Neodrag({ plugins: DEFAULTS.plugins, dev: false });
			engine.draggable(a, []);
			engine.draggable(b, []);

			dragSteps(a, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
			dragSteps(b, 320, DRAG.fromY, 420, DRAG.toY, DRAG.steps);
			await flushEffects();

			const ta = parseTranslate(a);
			const tb = parseTranslate(b);
			expect(Math.abs(ta.x - tb.x)).toBeLessThan(4);
			expect(Math.abs(ta.y - tb.y)).toBeLessThan(4);
			engine.dispose();
		});
	});
});
