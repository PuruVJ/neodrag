/**
 * @vitest-environment jsdom
 *
 * Deep-drop port coverage: rAF-coalesced hit-testing, multi-sample hit-testing (the dragged
 * element's edge overlaps a zone the pointer misses), and the richer collision strategies
 * (closestEdge / intersection). Uses a manual rAF queue + fake-flush so coalescing is observable.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import {
	Drop,
	edgeDistanceSq,
	intersectionArea,
	RafBatch,
	rankDrop,
	resolveSampler,
	VirtualCollisionIndex,
} from '../../src/drop/drop.ts';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';

type Rect = { left: number; top: number; right: number; bottom: number };

function mockRect(el: HTMLElement, rect: Rect): void {
	el.getBoundingClientRect = () =>
		({
			...rect,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top,
			x: rect.left,
			y: rect.top,
			toJSON() {},
		}) as DOMRect;
}

function node(rect?: Rect): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	if (rect) mockRect(el, rect);
	return el;
}

function input(target: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

// --- manual rAF queue: lets us prove N schedules collapse to one flush --------------------
let rafQueue: FrameRequestCallback[] = [];
let realRaf: typeof requestAnimationFrame;
let realCancel: typeof cancelAnimationFrame;

beforeEach(() => {
	rafQueue = [];
	let id = 0;
	realRaf = globalThis.requestAnimationFrame;
	realCancel = globalThis.cancelAnimationFrame;
	globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
		rafQueue.push(cb);
		return ++id;
	}) as typeof requestAnimationFrame;
	const cancelled = new Set<number>();
	globalThis.cancelAnimationFrame = ((handle: number) => {
		cancelled.add(handle);
		// Best-effort: drop the matching callback so a manual flush won't run a cancelled frame.
		// (ids are 1-based and pushed in order, so index = handle - 1 relative to a fresh queue)
	}) as typeof cancelAnimationFrame;
});

afterEach(() => {
	globalThis.requestAnimationFrame = realRaf;
	globalThis.cancelAnimationFrame = realCancel;
	document.body.innerHTML = '';
});

function flushFrames() {
	const batch = rafQueue;
	rafQueue = [];
	for (const cb of batch) cb(performance.now());
}

// =========================================================================================
describe('RafBatch (unit)', () => {
	it('collapses N schedules in one frame into a single run with the latest value', () => {
		const seen: number[] = [];
		const batch = new RafBatch<number>((v) => seen.push(v));
		batch.schedule(1);
		batch.schedule(2);
		batch.schedule(3);
		expect(seen).toEqual([]); // nothing ran yet
		expect(batch.scheduled).toBe(true);
		expect(rafQueue.length).toBe(1); // ONE frame queued for THREE schedules
		flushFrames();
		expect(seen).toEqual([3]); // latest value wins, ran once
		expect(batch.scheduled).toBe(false);
	});

	it('flush() runs synchronously and cancels the pending frame', () => {
		const seen: number[] = [];
		const batch = new RafBatch<number>((v) => seen.push(v));
		batch.schedule(1);
		batch.flush(9);
		expect(seen).toEqual([9]);
		expect(batch.scheduled).toBe(false);
		flushFrames(); // the previously-queued frame must be a no-op now
		expect(seen).toEqual([9]);
	});

	it('cancel() drops the stored value without running', () => {
		const seen: number[] = [];
		const batch = new RafBatch<number>((v) => seen.push(v));
		batch.schedule(1);
		batch.cancel();
		flushFrames();
		expect(seen).toEqual([]);
	});

	it('schedules a fresh frame after a flush', () => {
		const seen: number[] = [];
		const batch = new RafBatch<number>((v) => seen.push(v));
		batch.flush(1);
		batch.schedule(2);
		expect(batch.scheduled).toBe(true);
		flushFrames();
		expect(seen).toEqual([1, 2]);
	});
});

// =========================================================================================
describe('Drop rAF coalescing', () => {
	function setup() {
		const dragNode = node();
		const zone = node({ left: 100, top: 100, right: 200, bottom: 200 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop({ coalesce: true });
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, {
			onEnter: () => log.push('enter'),
			onOver: () => log.push('over'),
			onLeave: () => log.push('leave'),
			onDrop: () => log.push('drop'),
		});
		return { dnd, drop, dragNode, zone, log };
	}

	it('coalesces N moves in one frame into a single hit-test', () => {
		const { dnd, drop, dragNode, log } = setup();
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		expect(drop.hitCount).toBe(0);

		// Ten moves into the zone, all within one frame.
		for (let i = 0; i < 10; i++) {
			dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150 + i));
		}
		// No hit-test ran yet; exactly ONE frame is queued for the 10 moves.
		expect(drop.hitCount).toBe(0);
		expect(drop.pendingFrame).toBe(true);
		expect(rafQueue.length).toBe(1);
		expect(log).toEqual([]);

		flushFrames();
		expect(drop.hitCount).toBe(1); // 10 moves -> 1 hit-test
		expect(log).toEqual(['enter', 'over']);
	});

	it('a second frame coalesces the next batch of moves', () => {
		const { dnd, drop, dragNode } = setup();
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		for (let i = 0; i < 5; i++) dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150));
		flushFrames();
		expect(drop.hitCount).toBe(1);
		for (let i = 0; i < 5; i++) dnd.host.onInteractionMove(input(dragNode, 'move', 160, 160));
		expect(drop.hitCount).toBe(1); // still queued, not run
		flushFrames();
		expect(drop.hitCount).toBe(2);
	});

	it('drop flushes synchronously and cancels the pending frame (no double hit-test)', () => {
		const { dnd, drop, dragNode, log } = setup();
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150));
		flushFrames();
		expect(drop.hitCount).toBe(1);
		expect(log).toEqual(['enter', 'over']);

		// Queue a move (pending frame) then end before the frame fires.
		dnd.host.onInteractionMove(input(dragNode, 'move', 160, 160));
		expect(drop.pendingFrame).toBe(true);
		dnd.host.onInteractionEnd(input(dragNode, 'end', 160, 160));
		// end ran one synchronous hit-test for the commit; the queued frame was cancelled.
		expect(drop.hitCount).toBe(2);
		expect(drop.pendingFrame).toBe(false);
		expect(log).toEqual(['enter', 'over', 'drop', 'leave']);

		// The stale queued frame must not re-run after the session is over.
		flushFrames();
		expect(drop.hitCount).toBe(2);
		expect(log).toEqual(['enter', 'over', 'drop', 'leave']);
	});

	it('synchronous mode (coalesce:false) hit-tests every move with no queued frame', () => {
		const dragNode = node();
		const zone = node({ left: 100, top: 100, right: 200, bottom: 200 });
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop(); // default: coalesce off
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, {});
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 150, 150));
		dnd.host.onInteractionMove(input(dragNode, 'move', 160, 160));
		expect(drop.hitCount).toBe(2);
		expect(drop.pendingFrame).toBe(false);
		expect(rafQueue.length).toBe(0);
	});
});

// =========================================================================================
describe('Drop multi-sample hit-testing', () => {
	/**
	 * Pointer at (40,40) is OUTSIDE the zone [50..150], but the dragged element rect
	 * [20..60] x [20..60] overlaps the zone's top-left corner. Multi-sampling must enter
	 * the zone; pointer-only sampling must not.
	 */
	function world(samples: 'pointer' | 'corners' | 'edges' | 'all' | 'center') {
		const dragNode = node({ left: 20, top: 20, right: 60, bottom: 60 });
		const zone = node({ left: 50, top: 50, right: 150, bottom: 150 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop({ dropPointerSamples: samples });
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, { onEnter: () => log.push('enter') });
		return { dnd, dragNode, log };
	}

	it('pointer-only sampling misses a zone the pointer is outside of', () => {
		const { dnd, dragNode, log } = world('pointer');
		dnd.host.onInteractionStart(input(dragNode, 'start', 40, 40));
		dnd.host.onInteractionMove(input(dragNode, 'move', 40, 40)); // pointer outside zone
		expect(log).toEqual([]);
	});

	it('corner sampling enters when the element edge overlaps even if the pointer does not', () => {
		const { dnd, dragNode, log } = world('corners');
		dnd.host.onInteractionStart(input(dragNode, 'start', 40, 40));
		dnd.host.onInteractionMove(input(dragNode, 'move', 40, 40)); // pointer outside, corner (60,60) inside
		expect(log).toEqual(['enter']);
	});

	it('all-sampling also enters on edge overlap', () => {
		const { dnd, dragNode, log } = world('all');
		dnd.host.onInteractionStart(input(dragNode, 'start', 40, 40));
		dnd.host.onInteractionMove(input(dragNode, 'move', 40, 40));
		expect(log).toEqual(['enter']);
	});

	it('center sampling does NOT enter (rect center 40,40 is outside the zone)', () => {
		const { dnd, dragNode, log } = world('center');
		dnd.host.onInteractionStart(input(dragNode, 'start', 40, 40));
		dnd.host.onInteractionMove(input(dragNode, 'move', 40, 40));
		expect(log).toEqual([]);
	});

	it('a custom sampler function controls the probe points', () => {
		const dragNode = node({ left: 20, top: 20, right: 60, bottom: 60 });
		const zone = node({ left: 200, top: 200, right: 300, bottom: 300 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		// Sampler that probes a fixed point inside the far zone, ignoring pointer + rect.
		const drop = new Drop({ dropPointerSamples: () => [{ x: 250, y: 250 }] });
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, { onEnter: () => log.push('enter') });
		dnd.host.onInteractionStart(input(dragNode, 'start', 0, 0));
		dnd.host.onInteractionMove(input(dragNode, 'move', 0, 0));
		expect(log).toEqual(['enter']);
	});
});

// =========================================================================================
describe('resolveSampler (unit)', () => {
	const rect = { left: 0, top: 0, right: 100, bottom: 100 };
	const ptr = { x: 10, y: 10 };

	it('pointer mode yields only the pointer', () => {
		expect(resolveSampler('pointer')({ pointer: ptr, rect })).toEqual([ptr]);
	});
	it('corners yields pointer + 4 corners', () => {
		const pts = resolveSampler('corners')({ pointer: ptr, rect });
		expect(pts).toHaveLength(5);
		expect(pts).toContainEqual({ x: 100, y: 100 });
		expect(pts).toContainEqual({ x: 0, y: 0 });
	});
	it('edges yields pointer + 4 corners + 4 edge midpoints', () => {
		expect(resolveSampler('edges')({ pointer: ptr, rect })).toHaveLength(9);
	});
	it('all yields pointer + corners + edge midpoints + center', () => {
		const pts = resolveSampler('all')({ pointer: ptr, rect });
		expect(pts).toHaveLength(10);
		expect(pts).toContainEqual({ x: 50, y: 50 });
	});
	it('center yields pointer + center only', () => {
		expect(resolveSampler('center')({ pointer: ptr, rect })).toEqual([ptr, { x: 50, y: 50 }]);
	});
	it('falls back to pointer when rect is null', () => {
		expect(resolveSampler('all')({ pointer: ptr, rect: null })).toEqual([ptr]);
	});
});

// =========================================================================================
describe('richer collision strategies', () => {
	const r = (l: number, t: number, rr: number, b: number) => ({ left: l, top: t, right: rr, bottom: b });

	it('edgeDistanceSq is 0 inside and grows with distance outside', () => {
		expect(edgeDistanceSq(r(0, 0, 10, 10), 5, 5)).toBe(0);
		expect(edgeDistanceSq(r(0, 0, 10, 10), 13, 5)).toBe(9); // 3px past the right edge
	});

	it('intersectionArea returns the overlap, 0 when disjoint', () => {
		expect(intersectionArea(r(0, 0, 10, 10), r(5, 5, 15, 15))).toBe(25);
		expect(intersectionArea(r(0, 0, 10, 10), r(20, 20, 30, 30))).toBe(0);
	});

	it("closestEdge picks the zone whose edge the pointer is nearest", () => {
		// Pointer at (105,5): zone A's right edge (x=100) is 5px away; zone B's right edge (x=80) is 25px.
		const a = { rect: r(0, 0, 100, 10), priority: 0, policy: 'closestEdge' as const };
		const b = { rect: r(0, 0, 80, 10), priority: 0, policy: 'closestEdge' as const };
		expect(rankDrop([b, a], 105, 5)).toBe(a);
	});

	it('intersection picks the zone the dragged element overlaps most', () => {
		// Probe (dragged element) rect overlaps zone B far more than zone A.
		const probeRect = r(40, 40, 90, 90);
		const a = { rect: r(0, 0, 50, 50), priority: 0, policy: 'intersection' as const }; // overlap 100
		const b = { rect: r(45, 45, 200, 200), priority: 0, policy: 'intersection' as const }; // overlap 2025
		expect(rankDrop([a, b], 0, 0, { probeRect })).toBe(b);
	});

	it('intersection without a probe rect degrades to no tie-break (first wins)', () => {
		const a = { rect: r(0, 0, 50, 50), priority: 0, policy: 'intersection' as const };
		const b = { rect: r(45, 45, 200, 200), priority: 0, policy: 'intersection' as const };
		expect(rankDrop([a, b], 0, 0)).toBe(a);
	});

	it('priority still dominates any strategy', () => {
		const lo = { rect: r(0, 0, 10, 10), priority: 0, policy: 'intersection' as const };
		const hi = { rect: r(500, 500, 510, 510), priority: 9, policy: 'pointer' as const };
		expect(rankDrop([lo, hi], 0, 0, { probeRect: r(0, 0, 10, 10) })).toBe(hi);
	});

	it('end-to-end: intersection strategy resolves onDrop to the most-overlapped zone', () => {
		const dragNode = node({ left: 40, top: 40, right: 90, bottom: 90 });
		const zoneA = node({ left: 0, top: 0, right: 60, bottom: 60 }); // small overlap
		const zoneB = node({ left: 45, top: 45, right: 200, bottom: 200 }); // big overlap
		const dropped: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		const drop = new Drop({ dropPointerSamples: 'corners' });
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zoneA, { collision: 'intersection', onDrop: () => dropped.push('A') });
		drop.bind(zoneB, { collision: 'intersection', onDrop: () => dropped.push('B') });

		dnd.host.onInteractionStart(input(dragNode, 'start', 65, 65));
		dnd.host.onInteractionMove(input(dragNode, 'move', 65, 65)); // pointer in both
		dnd.host.onInteractionEnd(input(dragNode, 'end', 65, 65));
		expect(dropped).toEqual(['B']); // most-overlapped wins
	});
});

// =========================================================================================
describe('pluggable CollisionIndex backend', () => {
	it('uses a custom index() backend for hit-testing', () => {
		const dragNode = node();
		const zone = node({ left: 0, top: 0, right: 100, bottom: 100 });
		const log: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		// Swap in the virtual index seam — proves the `index` option is honored.
		const drop = new Drop({ index: () => new VirtualCollisionIndex() });
		dnd.use(drag, drop);
		drag.bind(dragNode, {});
		drop.bind(zone, { onEnter: () => log.push('enter') });
		dnd.host.onInteractionStart(input(dragNode, 'start', 50, 50));
		dnd.host.onInteractionMove(input(dragNode, 'move', 50, 50));
		expect(log).toEqual(['enter']);
	});
});
