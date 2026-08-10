/**
 * @vitest-environment jsdom
 *
 * SplitPane controller math: dragging a gutter moves a conserved budget between two neighbours, one
 * growing by exactly what the other loses, each clamped to its minimum. Plus the `splitGutter` drag
 * plugin returns {0,0} (the gutter never translates) while reporting the delta to the controller.
 */
import { describe, expect, it } from 'vitest';
import { SplitPaneController, splitGutter } from '../../src/splitpane/splitpane.ts';
import { MemoryBackend, Room } from '../../src/collab/index.ts';
import type { DragEventData } from '../../src/drag/drag.ts';

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

describe('SplitPaneController', () => {
	it('seeds equal weights as panes register', () => {
		const c = new SplitPaneController();
		c.ensureCount(3);
		expect(c.sizes).toEqual([1, 1, 1]);
	});

	it('a gutter drag redistributes a conserved budget between the pair', () => {
		const c = new SplitPaneController({ sizes: [1, 1] });
		c.beginGutter();
		// container 200px, drag gutter 0 by +50px → 50/200 * total(2) = 0.5 weight moves left.
		c.dragGutter(0, 50, 200);
		expect(c.sizes).toEqual([1.5, 0.5]);
		expect(sum(c.sizes)).toBe(2); // conserved
	});

	it('clamps so neither pane drops below its minimum', () => {
		const c = new SplitPaneController({ sizes: [1, 1], minSizes: 0.3 });
		c.beginGutter();
		// Pull far right (would push pane 1 negative) → pane 1 clamps to its 0.3 minimum.
		c.dragGutter(0, 500, 200);
		expect(c.sizes[1]).toBeCloseTo(0.3, 5);
		expect(c.sizes[0]).toBeCloseTo(1.7, 5);
		expect(sum(c.sizes)).toBeCloseTo(2, 5);
	});

	it('only the dragged pair moves; other panes are untouched', () => {
		const c = new SplitPaneController({ sizes: [1, 1, 1] });
		c.beginGutter();
		c.dragGutter(1, 30, 300); // gutter between pane 1 and 2
		expect(c.sizes[0]).toBe(1); // first pane unchanged
		expect(sum(c.sizes)).toBe(3);
	});

	it('endGutter emits the settled weights; setSizes is a programmatic set', () => {
		const settled: number[][] = [];
		const changed: number[][] = [];
		const c = new SplitPaneController({ sizes: [1, 1], onResize: (s) => settled.push(s), onChange: (s) => changed.push(s) });
		c.beginGutter();
		c.dragGutter(0, 20, 200);
		c.endGutter();
		expect(settled).toHaveLength(1);
		expect(changed.length).toBeGreaterThan(0);
		c.setSizes([3, 1]);
		expect(c.sizes).toEqual([3, 1]);
	});
});

describe('splitGutter drag plugin', () => {
	it('reports the axis delta to the controller and returns {0,0} (gutter stays anchored)', () => {
		const c = new SplitPaneController({ sizes: [1, 1], axis: 'x' });
		const plugin = splitGutter(c, 0, () => 200);
		plugin.onStart?.({} as DragEventData);
		const ev = { offset: { x: 50, y: 999 }, node: document.createElement('div'), input: {} } as unknown as DragEventData;
		const ret = plugin.onMove?.(ev);
		expect(ret).toEqual({ x: 0, y: 0 }); // never translates
		expect(c.sizes).toEqual([1.5, 0.5]); // x delta applied, y ignored (axis 'x')
		plugin.onEnd?.({} as DragEventData);
	});
});

describe('SplitPane collab', () => {
	it('a layout resized on A applies on B (last-write-wins splitpane op)', () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const a = new SplitPaneController({ sizes: [1, 1], id: 'layout' });
		const b = new SplitPaneController({ sizes: [1, 1], id: 'layout' });
		const roomA = new Room(ba);
		const roomB = new Room(bb);
		roomA.add(a, 'layout');
		roomB.add(b, 'layout');

		a.beginGutter();
		a.dragGutter(0, 50, 200); // → [1.5, 0.5]
		a.endGutter(); // commits the splitpane op

		expect(a.sizes).toEqual([1.5, 0.5]);
		expect(b.sizes).toEqual([1.5, 0.5]); // synced across the wire

		roomA.destroy();
		roomB.destroy();
	});

	it('in-flight presence streams the live layout, then a null terminator', () => {
		const frames: Array<number[] | null> = [];
		const a = new SplitPaneController({ sizes: [1, 1], id: 'layout' });
		const off = a.onPresence((p) => frames.push(p && p.type === 'splitpane' ? p.sizes : null));

		a.beginGutter();
		a.dragGutter(0, 40, 200);
		a.endGutter();
		off();

		expect(frames.length).toBeGreaterThanOrEqual(2);
		expect(frames.at(-1)).toBeNull(); // terminator on release
		expect(frames[0]![0]).toBeCloseTo(1.4, 5); // the live layout streamed mid-drag
		expect(frames[0]![1]).toBeCloseTo(0.6, 5);
	});
});
