/**
 * Drop and sortable behavioral guards in Chromium.
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { accepts, onDrop } from '../../src/drop-plugins.ts';
import { dragData } from '../../src/plugins.ts';
import { sortable } from '../../src/drop/index.ts';
import { createBox, dragSteps, flushEffects, resetBody } from './helpers.ts';

describe('drop & sortable behavioral guards', () => {
	it('drop fires onDrop once when released over zone', async () => {
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

	it('sortable reorders items after drag', async () => {
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
			li.style.cssText = 'padding:12px;margin:4px 0;height:24px;background:#b8e0ff';
			li.textContent = item.text;
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
			r3.top + r3.height / 2,
			14,
		);
		await flushEffects();

		expect(items.map((i) => i.id)[0]).not.toBe('1');

		engine.dispose();
		container.remove();
	});
});
