/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyGroupedSortableTransfer, Sortable } from '../../src/drop/index.ts';
import { Neodrag } from '../../src/index.ts';

function patchPointerCapture() {
	const proto = HTMLElement.prototype;
	const prev = {
		set: proto.setPointerCapture,
		release: proto.releasePointerCapture,
		getAnimations: proto.getAnimations,
	};
	proto.setPointerCapture = function () {};
	proto.releasePointerCapture = function () {};
	if (!proto.getAnimations) {
		proto.getAnimations = function () {
			return [];
		};
	}
	return () => {
		proto.setPointerCapture = prev.set;
		proto.releasePointerCapture = prev.release;
		if (prev.getAnimations) proto.getAnimations = prev.getAnimations;
		else delete (proto as { getAnimations?: () => Animation[] }).getAnimations;
	};
}

type Card = { id: string; column: 'a' | 'b' };

describe('sortable grouped transfer (jsdom)', () => {
	let restore: (() => void) | undefined;
	let rafQueue: FrameRequestCallback[] = [];

	beforeEach(() => {
		rafQueue = [];
		let rafId = 0;
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			rafQueue.push(cb);
			return ++rafId;
		});
		vi.stubGlobal('cancelAnimationFrame', () => {});
	});

	afterEach(() => {
		restore?.();
		vi.unstubAllGlobals();
	});

	function flushRaf() {
		for (const cb of rafQueue) cb(performance.now());
		rafQueue = [];
	}

	it('moves item to another column on drop', () => {
		restore = patchPointerCapture();

		let cards: Card[] = [
			{ id: '1', column: 'a' },
			{ id: '2', column: 'a' },
			{ id: '3', column: 'b' },
		];

		const in_column = (column: 'a' | 'b') => cards.filter((c) => c.column === column);

		const boardA = new Sortable({
			items: () => in_column('a'),
			keyBy: (c) => c.id,
			group: 'kanban',
			onReorder: (next) => {
				cards = [
					...cards.filter((c) => c.column !== 'a'),
					...next.map((c) => ({ ...c, column: 'a' as const })),
				];
			},
			onTransfer: (item, meta) => {
				if (meta.phase !== 'commit' || meta.toIndex < 0) return;
				cards = applyGroupedSortableTransfer(cards, item, {
					toIndex: meta.toIndex,
					column: 'a',
					columnOf: (row) => row.column,
					withColumn: (row, col) => ({ ...row, column: col }),
				});
			},
		});

		let transferred = false;
		const boardB = new Sortable({
			items: () => in_column('b'),
			keyBy: (c) => c.id,
			group: 'kanban',
			onReorder: (next) => {
				cards = [
					...cards.filter((c) => c.column !== 'b'),
					...next.map((c) => ({ ...c, column: 'b' as const })),
				];
			},
			onTransfer: (item, meta) => {
				if (meta.phase !== 'commit' || meta.toIndex < 0) return;
				transferred = true;
				cards = applyGroupedSortableTransfer(cards, item, {
					toIndex: meta.toIndex,
					column: 'b',
					columnOf: (row) => row.column,
					withColumn: (row, col) => ({ ...row, column: col }),
				});
			},
		});

		const engine = new Neodrag({ dev: false });
		const colA = document.createElement('section');
		const colB = document.createElement('section');
		colA.style.cssText = 'position:absolute;left:0;top:0;width:120px;height:200px';
		colB.style.cssText = 'position:absolute;left:140px;top:0;width:120px;height:200px';
		document.body.append(colA, colB);
		const rect = (left: number) =>
			({
				left,
				top: 0,
				right: left + 120,
				bottom: 200,
				width: 120,
				height: 200,
				x: left,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;
		colA.getBoundingClientRect = () => rect(0);
		colB.getBoundingClientRect = () => rect(140);

		const card1 = document.createElement('button');
		card1.getBoundingClientRect = () => rect(0);
		card1.textContent = '1';
		card1.style.cssText = 'display:block;margin:8px 0';
		colA.append(card1);

		const cardRect = (left: number, top: number, height: number) =>
			({
				left,
				top,
				right: left + 120,
				bottom: top + height,
				width: 120,
				height,
				x: left,
				y: top,
				toJSON: () => ({}),
			}) as DOMRect;

		const card3 = document.createElement('button');
		card3.getBoundingClientRect = () => cardRect(140, 60, 20);
		card3.textContent = '3';
		card3.style.cssText = 'display:block;margin:8px 0';
		colB.append(card3);

		engine.droppable(colA, boardA.container());
		engine.droppable(colB, boardB.container());
		engine.draggable(card1, boardA.item('1'), { threshold: null });
		engine.draggable(card3, boardB.item('3'), { threshold: null });

		const dispatch = (type: string, x: number, y: number) => {
			const ev = new PointerEvent(type, {
				bubbles: true,
				cancelable: true,
				clientX: x,
				clientY: y,
				pointerId: 1,
				button: 0,
				isPrimary: true,
			});
			card1.dispatchEvent(ev);
			document.documentElement.dispatchEvent(ev);
		};

		const pickStack = (x: number) => {
			const hits: Element[] =
				x >= 140 ? [card3, colB] : [card1, colA];
			hits.push(document.body, document.documentElement);
			return hits;
		};
		document.elementFromPoint = (x) => pickStack(x)[0] ?? null;
		document.elementsFromPoint = (x) => pickStack(x);

		dispatch('pointerdown', 20, 40);
		for (const x of [40, 80, 120, 160, 200]) {
			dispatch('pointermove', x, 80);
			flushRaf();
		}
		dispatch('pointerup', 200, 80);
		flushRaf();

		expect(transferred).toBe(true);
		expect(cards.filter((c) => c.column === 'a').map((c) => c.id)).toEqual(['2']);
		expect(cards.filter((c) => c.column === 'b').map((c) => c.id)).toEqual(['1', '3']);

		engine.dispose();
		colA.remove();
		colB.remove();
	});
});
