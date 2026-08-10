import { afterEach, describe, expect, it } from 'vitest';
import { Draggable, Droppable, Resizable, SortableList } from '../../src/index.ts';
import {
	assertDragInvariants,
	assertResizeInvariants,
	createDragFuzzGesture,
	createSortableFuzzGesture,
	fuzz,
	fuzzDrag,
	midpointThrash,
	resizeCornerChaos,
	scribbleInPlace,
	sortableItemAt,
	sortableItems,
	wildDrag,
	wildDropApproach,
	wildReorder,
	wildResize,
} from '@neodrag/test';

const cleanups: Array<() => void> = [];

afterEach(() => {
	for (const c of cleanups.splice(0)) c();
	document.body.innerHTML = '';
});

function box(style: Partial<CSSStyleDeclaration> = {}): HTMLDivElement {
	const el = document.createElement('div');
	Object.assign(el.style, { position: 'absolute', width: '60px', height: '60px', background: '#39f' }, style);
	document.body.appendChild(el);
	return el;
}

function frame(style: Partial<CSSStyleDeclaration> = {}): HTMLDivElement {
	const el = document.createElement('div');
	Object.assign(el.style, { position: 'absolute', overflow: 'hidden' }, style);
	document.body.appendChild(el);
	return el;
}

/** A sortable list whose DOM is physically reordered on commit so positions stay live. */
function makeList(id: string, n: number, top: number): { list: HTMLUListElement; items: string[] } {
	const list = document.createElement('ul');
	Object.assign(list.style, {
		position: 'absolute',
		left: id === 'a' ? '20px' : '260px',
		top: `${top}px`,
		width: '200px',
		margin: '0',
		padding: '0',
		listStyle: 'none',
	});
	const items: string[] = [];
	for (let i = 0; i < n; i++) {
		const key = `${id}${i}`;
		items.push(key);
		const li = document.createElement('li');
		li.setAttribute('data-neodrag-sortable-key', key);
		li.textContent = key;
		Object.assign(li.style, { height: '40px', lineHeight: '40px', background: '#eee', marginBottom: '4px' });
		list.appendChild(li);
	}
	document.body.appendChild(list);
	return { list, items };
}

function reorderDom(list: HTMLElement, keyOrder: string[]) {
	const byKey = new Map<string, Element>();
	for (const li of list.querySelectorAll('[data-neodrag-sortable-key]')) {
		byKey.set(li.getAttribute('data-neodrag-sortable-key')!, li);
	}
	for (const key of keyOrder) {
		const node = byKey.get(key);
		if (node) list.appendChild(node);
	}
}

describe('v3 core — real-browser fuzz stress', () => {
	it('drag survives chaotic gestures within bounds (no NaN/escape)', async () => {
		const parent = frame({ left: '40px', top: '40px', width: '400px', height: '400px', border: '1px solid #000' });
		const el = box({ left: '180px', top: '180px' });
		parent.appendChild(el);
		const d = new Draggable(el, { bounds: 'parent' });
		cleanups.push(() => d.destroy());

		const result = await fuzz({
			count: 30,
			invariants: 'drag',
			gesture: createDragFuzzGesture(el, async (node, ctx) => {
				await fuzzDrag(node, { seed: ctx.seed, intensity: 'chaotic', area: { width: 600, height: 600 } });
			}),
		});

		expect(result.failures).toEqual([]);
		// stayed inside the parent the whole time
		const r = el.getBoundingClientRect();
		const p = parent.getBoundingClientRect();
		expect(r.left).toBeGreaterThanOrEqual(p.left - 1);
		expect(r.right).toBeLessThanOrEqual(p.right + 1);
		expect(el.style.translate).not.toContain('NaN');
	});

	it('axis-locked drag never moves on the locked axis under wild input', async () => {
		const el = box({ left: '200px', top: '200px' });
		const d = new Draggable(el, { axis: 'x' });
		cleanups.push(() => d.destroy());
		for (let s = 0; s < 8; s++) {
			await wildDrag(el, el, { seed: s * 7 + 1, intensity: 'wild' });
			await scribbleInPlace(el, { seed: s, intensity: 'chaotic', radius: 50 });
			await assertDragInvariants({ element: el });
			const ty = (el.style.translate.split(/\s+/)[1] ?? '0px').replace('px', '');
			expect(Math.abs(parseFloat(ty) || 0)).toBeLessThan(0.001);
		}
	});

	it('sortable keys stay a permutation through wild reorders + midpoint thrash', async () => {
		const { list, items } = makeList('a', 6, 40);
		const data = items.map((id) => ({ id }));
		const s = new SortableList(list, {
			items: data,
			
			onReorder: (next) => {
				data.splice(0, data.length, ...next);
				reorderDom(list, next.map((x) => x.id));
			},
			animation: false,
		});
		cleanups.push(() => s.destroy());

		const result = await fuzz({
			count: 25,
			gesture: createSortableFuzzGesture(
				async () => (await sortableItems(list))[0]!,
				list,
				async (_item, listEl, ctx) => {
					const all = await sortableItems(listEl);
					const from = ctx.rng.int(all.length);
					const to = ctx.rng.int(all.length);
					await wildReorder(all[from]!, to, listEl, { seed: ctx.seed, intensity: 'wild' });
					if (all.length > 1) {
						await midpointThrash(all[0]!, all[1]!, { seed: ctx.seed + 1, passes: 6 });
					}
				},
			),
		});

		expect(result.failures).toEqual([]);
		// data + DOM agree, still 6 unique items
		const domKeys = [...list.querySelectorAll('[data-neodrag-sortable-key]')].map((n) => n.getAttribute('data-neodrag-sortable-key'));
		expect(new Set(domKeys).size).toBe(6);
		expect(domKeys.sort()).toEqual([...items].sort());
	});

	it('cross-container transfer keeps both lists consistent', async () => {
		const a = makeList('a', 4, 40);
		const b = makeList('b', 4, 40);
		const dataA = a.items.map((id) => ({ id }));
		const dataB = b.items.map((id) => ({ id }));
		const onReorder = (list: HTMLElement, data: { id: string }[]) => (next: { id: string }[]) => {
			data.splice(0, data.length, ...next);
			reorderDom(list, next.map((x) => x.id));
		};
		const sa = new SortableList(a.list, { items: dataA, group: 'g', onReorder: onReorder(a.list, dataA), animation: false });
		const sb = new SortableList(b.list, { items: dataB, group: 'g', onReorder: onReorder(b.list, dataB), animation: false });
		cleanups.push(() => sa.destroy(), () => sb.destroy());

		// drag a0 over into list b a few times with wild input
		for (let s = 0; s < 5; s++) {
			const fromItems = await sortableItems(a.list);
			if (fromItems.length === 0) break;
			await wildDrag(fromItems[0]!, await sortableItemAt(b.list, 0), { seed: s * 13 + 3, intensity: 'normal' });
		}
		const total = a.list.querySelectorAll('[data-neodrag-sortable-key]').length + b.list.querySelectorAll('[data-neodrag-sortable-key]').length;
		expect(total).toBe(8); // no items lost or duplicated across containers
	});

	it('drop highlight churns without throwing under repeated wild approaches', async () => {
		const drag = box({ left: '40px', top: '300px' });
		const zone = frame({ left: '300px', top: '260px', width: '160px', height: '160px', border: '2px dashed #c33' });
		let enters = 0;
		const d = new Draggable(drag, {});
		const z = new Droppable(zone, { onEnter: () => enters++, onDrop: () => {} });
		cleanups.push(() => d.destroy(), () => z.destroy());

		await expect(
			(async () => {
				for (let s = 0; s < 6; s++) {
					await wildDropApproach(drag, zone, { seed: s * 5 + 2, intensity: 'wild', passes: 3 });
				}
			})(),
		).resolves.toBeUndefined();
		expect(enters).toBeGreaterThan(0);
	});

	it('resize stays valid (finite, non-negative) under corner chaos + bounds', async () => {
		const parent = frame({ left: '40px', top: '40px', width: '500px', height: '500px' });
		const el = box({ left: '60px', top: '60px', width: '120px', height: '90px' });
		parent.appendChild(el);
		for (const edge of ['se', 'ne', 'sw'] as const) {
			const h = document.createElement('div');
			h.setAttribute('data-neodrag-resize-handle', edge);
			Object.assign(h.style, { position: 'absolute', width: '12px', height: '12px', right: '0', bottom: '0' });
			el.appendChild(h);
		}
		const r = new Resizable(el, { minWidth: 20, minHeight: 20, maxWidth: 460, maxHeight: 460 });
		cleanups.push(() => r.destroy());

		for (let s = 0; s < 12; s++) {
			await resizeCornerChaos(el, 'se', { seed: s * 9 + 1 });
			await wildResize(el, 'se', { seed: s * 3, overshoot: 800 }); // way past max → must clamp
			await assertResizeInvariants(el);
			const w = parseFloat(getComputedStyle(el).width);
			expect(w).toBeLessThanOrEqual(460 + 0.5);
			expect(w).toBeGreaterThanOrEqual(20 - 0.5);
		}
	});

	it('one element that is BOTH draggable and resizable composes without conflict', async () => {
		const el = box({ left: '200px', top: '200px', width: '100px', height: '100px' });
		const h = document.createElement('div');
		h.setAttribute('data-neodrag-resize-handle', 'se');
		Object.assign(h.style, { position: 'absolute', right: '0', bottom: '0', width: '14px', height: '14px' });
		el.appendChild(h);
		const d = new Draggable(el, {});
		const r = new Resizable(el, { minWidth: 30, minHeight: 30 });
		cleanups.push(() => d.destroy(), () => r.destroy());

		// drag from the body, resize from the handle — interleaved, wild
		for (let s = 0; s < 6; s++) {
			await wildDrag(el, el, { seed: s + 1, intensity: 'wild' });
			await wildResize(el, 'se', { seed: s * 2 + 1 });
			await assertDragInvariants({ element: el });
			await assertResizeInvariants(el);
		}
		expect(el.style.translate).not.toContain('NaN');
	});
});
