/**
 * @vitest-environment jsdom
 *
 * marqueeSelect: a `use:[]` drag plugin. It hit-tests `getItems()` against the box (anchored at
 * pointer − offset) each move, reports the touched elements, and returns {0,0} so the region — a
 * real `Draggable` — never translates.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { marqueeSelect, rectsOverlap } from '../../src/extend/marquee.ts';
import type { DragEventData } from '../../src/drag/drag.ts';
import { mockRect } from './_browser.ts';

afterEach(() => {
	document.body.innerHTML = '';
});

const item = (l: number, t: number, r: number, b: number) => {
	const el = document.createElement('div');
	document.body.appendChild(el);
	mockRect(el, { left: l, top: t, right: r, bottom: b });
	return el;
};
const move = (ox: number, oy: number, cx: number, cy: number) =>
	({ offset: { x: ox, y: oy }, node: document.body, input: { clientX: cx, clientY: cy } }) as unknown as DragEventData;

describe('rectsOverlap', () => {
	it('overlap vs disjoint', () => {
		expect(rectsOverlap({ left: 0, top: 0, right: 50, bottom: 50 }, { left: 40, top: 40, right: 90, bottom: 90 })).toBe(true);
		expect(rectsOverlap({ left: 0, top: 0, right: 50, bottom: 50 }, { left: 60, top: 0, right: 90, bottom: 50 })).toBe(false);
	});
});

describe('marqueeSelect plugin', () => {
	it('reports the items the box touches and never moves the region', () => {
		const a = item(10, 10, 50, 50);
		const b = item(80, 10, 120, 50);
		const c = item(10, 80, 50, 120);
		let hit: Element[] = [];
		const plugin = marqueeSelect(() => [a, b, c], (els) => (hit = els), { box: false });

		plugin.onStart!(move(0, 0, 5, 5));
		// box anchored at (5,5) [= input(60,60) − offset(55,55)] → (5,5)-(60,60): touches only `a`.
		const ret = plugin.onMove!(move(55, 55, 60, 60));
		expect(ret).toEqual({ x: 0, y: 0 }); // region stays put
		expect(hit).toEqual([a]);

		// drag further → (5,5)-(130,130) covers all three.
		plugin.onMove!(move(125, 125, 130, 130));
		expect(hit).toEqual([a, b, c]);

		plugin.onEnd!(move(125, 125, 130, 130));
	});

	it('draws a box on the body while active and removes it on end', () => {
		const a = item(10, 10, 50, 50);
		const plugin = marqueeSelect(() => [a], () => {}); // box on (default)
		plugin.onStart!(move(0, 0, 5, 5));
		plugin.onMove!(move(55, 55, 60, 60));
		const box = [...document.body.children].find((c) => c !== a && (c as HTMLElement).style.position === 'fixed');
		expect(box).toBeTruthy();
		plugin.onEnd!(move(55, 55, 60, 60));
		expect([...document.body.children].some((c) => c !== a && (c as HTMLElement).style.position === 'fixed')).toBe(false);
	});
});
