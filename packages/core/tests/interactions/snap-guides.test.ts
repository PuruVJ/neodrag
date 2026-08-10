/**
 * @vitest-environment jsdom
 *
 * snapGuides: while dragging, the element's edges/center lock to a target's within `threshold`,
 * and the move offset is nudged by exactly the snap delta. The `_bestSnap` resolver is pure.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { snapGuides, _bestSnap } from '../../src/extend/snap-guides.ts';
import type { DragEventData } from '../../src/drag/drag.ts';
import { mockRect } from './_browser.ts';

afterEach(() => {
	document.body.innerHTML = '';
});

describe('_bestSnap', () => {
	it('locks to the closest line within the threshold', () => {
		// dragged right edge at 101 → target left edge at 103 is 2px away (≤5).
		expect(_bestSnap([1, 51, 101], [[103, 153, 203]], 5)).toEqual({ delta: 2, at: 103 });
	});
	it('returns null when nothing is within range', () => {
		expect(_bestSnap([1, 51, 101], [[110, 160, 210]], 5)).toBeNull();
	});
	it('prefers the smallest delta across all edge/center pairs', () => {
		// 101→103 (2) beats 51→55 (4); picks the 2.
		expect(_bestSnap([1, 51, 101], [[55, 103]], 6)).toEqual({ delta: 2, at: 103 });
	});
});

describe('snapGuides plugin', () => {
	const ev = (x: number, y: number, node: HTMLElement) =>
		({ offset: { x, y }, node, input: {} }) as unknown as DragEventData;

	it('nudges the offset so an edge aligns to a nearby target', () => {
		const dragged = document.createElement('div');
		const target = document.createElement('div');
		document.body.append(dragged, target);
		mockRect(dragged, { left: 0, top: 0, right: 100, bottom: 50 }); // 100×50 at origin
		mockRect(target, { left: 104, top: 0, right: 204, bottom: 50 }); // 4px gap on the right

		const plugin = snapGuides({ targets: [dragged, target], threshold: 5, guides: false });
		plugin.onStart!(ev(0, 0, dragged));
		// nudge right 1px → dragged.right = 101; target.left = 104 → snap delta +3.
		const out = plugin.onMove!(ev(1, 0, dragged));
		expect(out).toEqual({ x: 4, y: 0 }); // 1 + 3; right edge now at 104 = target.left
		plugin.onEnd!(ev(1, 0, dragged));
	});

	it('reads a `targets` getter fresh at each gesture start (stays live)', () => {
		const dragged = document.createElement('div');
		const target = document.createElement('div');
		document.body.append(dragged, target);
		mockRect(dragged, { left: 0, top: 0, right: 100, bottom: 50 });
		mockRect(target, { left: 104, top: 0, right: 204, bottom: 50 });

		let live: Element[] = []; // empty first gesture, populated before the second
		const plugin = snapGuides({
			get targets() {
				return live;
			},
			threshold: 5,
			guides: false,
		});

		// First gesture: no targets → no snap.
		plugin.onStart!(ev(0, 0, dragged));
		expect(plugin.onMove!(ev(1, 0, dragged))).toEqual({ x: 1, y: 0 });
		plugin.onEnd!(ev(1, 0, dragged));

		// The getter now returns the target; the next gesture picks it up without rebuilding the plugin.
		live = [dragged, target];
		plugin.onStart!(ev(0, 0, dragged));
		expect(plugin.onMove!(ev(1, 0, dragged))).toEqual({ x: 4, y: 0 });
		plugin.onEnd!(ev(1, 0, dragged));
	});

	it('passes the offset through unchanged when no target is in range', () => {
		const dragged = document.createElement('div');
		const target = document.createElement('div');
		document.body.append(dragged, target);
		mockRect(dragged, { left: 0, top: 0, right: 100, bottom: 50 });
		mockRect(target, { left: 400, top: 400, right: 500, bottom: 450 }); // far away

		const plugin = snapGuides({ targets: [dragged, target], threshold: 5, guides: false });
		plugin.onStart!(ev(0, 0, dragged));
		expect(plugin.onMove!(ev(20, 20, dragged))).toEqual({ x: 20, y: 20 });
		plugin.onEnd!(ev(20, 20, dragged));
	});

	it('draws a guide line while snapped and removes it on end', () => {
		const dragged = document.createElement('div');
		const target = document.createElement('div');
		document.body.append(dragged, target);
		mockRect(dragged, { left: 0, top: 0, right: 100, bottom: 50 });
		mockRect(target, { left: 104, top: 0, right: 204, bottom: 50 });

		const plugin = snapGuides({ targets: [dragged, target], threshold: 5 }); // guides on
		plugin.onStart!(ev(0, 0, dragged));
		plugin.onMove!(ev(1, 0, dragged));
		// a vertical guide div appears on the body at the snapped x
		const guide = [...document.body.children].find(
			(c) => c !== dragged && c !== target && (c as HTMLElement).style.width === '1px',
		) as HTMLElement | undefined;
		expect(guide).toBeTruthy();
		expect(guide!.style.left).toBe('104px');
		plugin.onEnd!(ev(1, 0, dragged));
		expect([...document.body.children].some((c) => (c as HTMLElement).style.width === '1px')).toBe(false);
	});
});
