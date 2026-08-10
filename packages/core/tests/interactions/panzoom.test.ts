/**
 * @vitest-environment jsdom
 *
 * PanZoom controller math: pan translates the world 1:1 with the drag offset; zoom keeps the point
 * under the cursor fixed on screen and clamps to the scale bounds. Plus the `pan` drag plugin returns
 * {0,0} (the viewport never translates) while feeding the offset to the controller.
 */
import { describe, expect, it } from 'vitest';
import { PanZoomController, pan } from '../../src/panzoom/panzoom.ts';
import { MemoryBackend, Room } from '../../src/collab/index.ts';
import type { DragEventData } from '../../src/drag/drag.ts';

const move = (ox: number, oy: number) => ({ offset: { x: ox, y: oy } }) as DragEventData;

describe('PanZoomController', () => {
	it('starts at the given transform, clamping the initial scale', () => {
		const c = new PanZoomController({ x: 10, y: 20, scale: 100, maxScale: 8 });
		expect(c.transform).toEqual({ x: 10, y: 20, scale: 8 });
	});

	it('panBy accumulates translate', () => {
		const c = new PanZoomController();
		c.panBy(30, -15);
		c.panBy(5, 5);
		expect(c.transform).toEqual({ x: 35, y: -10, scale: 1 });
	});

	it('keeps the point under the cursor fixed while zooming', () => {
		const c = new PanZoomController({ scale: 1, x: 0, y: 0 });
		const [cx, cy] = [120, 80];
		const worldBefore = { x: (cx - c.x) / c.scale, y: (cy - c.y) / c.scale };
		c.zoomTo(2, cx, cy);
		expect(c.scale).toBe(2);
		// The same world point must still sit under (cx, cy).
		const worldAfter = { x: (cx - c.x) / c.scale, y: (cy - c.y) / c.scale };
		expect(worldAfter.x).toBeCloseTo(worldBefore.x, 6);
		expect(worldAfter.y).toBeCloseTo(worldBefore.y, 6);
		// Concretely: world point (120,80) pinned → translate shifts by -(scale-1)*point.
		expect(c.x).toBeCloseTo(-120, 6);
		expect(c.y).toBeCloseTo(-80, 6);
	});

	it('zoomBy multiplies and clamps to the bounds', () => {
		const c = new PanZoomController({ minScale: 0.5, maxScale: 4, scale: 1 });
		c.zoomBy(10, 0, 0);
		expect(c.scale).toBe(4);
		c.zoomBy(0.001, 0, 0);
		expect(c.scale).toBe(0.5);
	});

	it('reset restores the initial transform', () => {
		const c = new PanZoomController({ x: 5, y: 5, scale: 2 });
		c.panBy(100, 100);
		c.zoomTo(4, 0, 0);
		c.reset();
		expect(c.transform).toEqual({ x: 5, y: 5, scale: 2 });
	});

	it('emits on every change via onChange', () => {
		const seen: number[] = [];
		const c = new PanZoomController({ onChange: (t) => seen.push(t.scale) });
		c.panBy(1, 1);
		c.zoomTo(2, 0, 0);
		expect(seen).toEqual([1, 2]);
	});
});

describe('pan plugin', () => {
	it('feeds the drag offset to the controller and never translates the viewport', () => {
		const c = new PanZoomController({ x: 10, y: 10 });
		const plugin = pan(c);
		plugin.onStart!(move(0, 0));
		const ret = plugin.onMove!(move(40, -25));
		expect(ret).toEqual({ x: 0, y: 0 }); // viewport stays put
		expect(c.transform).toEqual({ x: 50, y: -15, scale: 1 }); // start(10,10) + offset(40,-25)
		plugin.onMove!(move(60, -25));
		expect(c.transform).toMatchObject({ x: 70, y: -15 });
		plugin.onEnd!(move(60, -25));
		// After the gesture ends, a stray move does nothing (no active pan).
		plugin.onMove!(move(999, 999));
		expect(c.transform).toMatchObject({ x: 70, y: -15 });
	});
});

describe('PanZoom collab', () => {
	const room = () => {
		const [ba, bb] = MemoryBackend.pair('A', 'B');
		const a = new PanZoomController({ id: 'canvas' });
		const b = new PanZoomController({ id: 'canvas' });
		const roomA = new Room(ba);
		const roomB = new Room(bb);
		roomA.add(a, 'canvas');
		roomB.add(b, 'canvas');
		return { a, b, dispose: () => (roomA.destroy(), roomB.destroy()) };
	};

	it('a pan released on A applies on B (last-write-wins panzoom op)', () => {
		const { a, b, dispose } = room();
		a.beginPan();
		a.panTo(60, 30);
		a.endPan(); // commits the panzoom op
		expect(a.transform).toEqual({ x: 60, y: 30, scale: 1 });
		expect(b.transform).toEqual({ x: 60, y: 30, scale: 1 }); // synced
		dispose();
	});

	it('a zoom on A applies on B, cursor-pinned the same on both', () => {
		const { a, b, dispose } = room();
		a.zoomTo(2, 100, 50); // pin viewport-local (100,50)
		expect(a.scale).toBe(2);
		expect(b.transform).toEqual(a.transform); // identical transform on the peer
		dispose();
	});

	it('a local pan ignores remote facts mid-gesture, then re-syncs on release', () => {
		const c = new PanZoomController({ id: 'x' });
		c.beginPan();
		c.panTo(10, 0);
		// A remote commit arriving while the local pan owns the viewport is ignored (local wins).
		c.applyExternal({ type: 'panzoom', target: 'x', x: 999, y: 999, scale: 4 });
		expect(c.transform).toMatchObject({ x: 10, scale: 1 });
		c.endPan();
		// Once idle, remote facts apply.
		c.applyExternal({ type: 'panzoom', target: 'x', x: 5, y: 5, scale: 2 });
		expect(c.transform).toEqual({ x: 5, y: 5, scale: 2 });
	});

	it('ignores a foreign op kind', () => {
		const c = new PanZoomController({ id: 'x', x: 1, y: 2, scale: 1 });
		c.applyExternal({ type: 'splitpane', target: 'x', sizes: [1, 1] });
		expect(c.transform).toEqual({ x: 1, y: 2, scale: 1 }); // untouched
	});
});
