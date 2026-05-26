import { DEFAULTS, Neodrag } from '../../src/index.ts';
import { BoundsFrom, axis, bounds, disabled } from '../../src/plugins.ts';
import { accepts, highlight, onDrop } from '../../src/drop-plugins.ts';
import { dragData } from '../../src/plugins.ts';
import { sortable } from '../../src/drop/index.ts';
import {
	createBox,
	dragElementByDelta,
	dragSteps,
	flushEffects,
	pointer,
	resetBody,
} from './helpers.ts';

export const DRAG = {
	fromX: 120,
	fromY: 120,
	toX: 220,
	toY: 220,
	steps: 16,
};

export type HumanScenario = {
	id: string;
	group: string;
	run: () => Promise<void>;
};

export function humanScenarios(): HumanScenario[] {
	return [
		{
			id: 'drag-move-by-delta',
			group: 'drag',
			async run() {
				resetBody();
				const box = createBox();
				const engine = new Neodrag({ dev: false });
				const handle = engine.draggable(box, []);
				dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
				await flushEffects();
				handle.destroy();
				engine.dispose();
			},
		},
		{
			id: 'drag-disabled',
			group: 'drag',
			async run() {
				resetBody();
				const box = createBox();
				const engine = new Neodrag({ dev: false });
				engine.draggable(box, [disabled()], { threshold: null });
				dragElementByDelta(box, 80, 80, 8);
				await flushEffects();
				engine.dispose();
			},
		},
		{
			id: 'drag-axis-x',
			group: 'drag',
			async run() {
				resetBody();
				const box = createBox();
				const engine = new Neodrag({ dev: false });
				engine.draggable(box, [axis('x')], { threshold: null });
				dragElementByDelta(box, 60, 60, 10);
				await flushEffects();
				engine.dispose();
			},
		},
		{
			id: 'drag-bounds-parent',
			group: 'drag',
			async run() {
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
				engine.dispose();
				parent.remove();
			},
		},
		{
			id: 'drop-once-matching',
			group: 'drop',
			async run() {
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
				engine.dispose();
				zone.remove();
			},
		},
		{
			id: 'drop-highlight-over',
			group: 'drop',
			async run() {
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
				pointer(box, 'pointerup', overX, overY);
				await flushEffects();
				engine.dispose();
				zone.remove();
			},
		},
		{
			id: 'sortable-reorder',
			group: 'sortable',
			async run() {
				resetBody();
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
				const list = sortable({
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
				const first = container.querySelector('[data-sortable-key="1"]') as HTMLElement;
				const third = container.querySelector('[data-sortable-key="3"]') as HTMLElement;
				const r1 = first.getBoundingClientRect();
				const r3 = third.getBoundingClientRect();
				dragSteps(
					first,
					r1.left + r1.width / 2,
					r1.top + r1.height / 2,
					r3.left + r3.width / 2,
					r3.top + r3.height + 8,
					16,
				);
				await flushEffects();
				engine.dispose();
				container.remove();
			},
		},
		{
			id: 'engine-two-dragables',
			group: 'engine',
			async run() {
				resetBody();
				const a = createBox('100px', '100px');
				const b = createBox('300px', '100px');
				const engine = new Neodrag({ plugins: DEFAULTS.plugins, dev: false });
				engine.draggable(a, []);
				engine.draggable(b, []);
				dragSteps(a, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
				dragSteps(b, 320, DRAG.fromY, 420, DRAG.toY, DRAG.steps);
				await flushEffects();
				engine.dispose();
			},
		},
	];
}
