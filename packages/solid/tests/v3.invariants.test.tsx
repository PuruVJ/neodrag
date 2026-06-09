import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { DragEventData } from '@neodrag/core';
import { createDraggable } from '../src/index.ts';
import {
	dragAndDrop,
	dispatchPointer,
	getElementCoords,
	startCursorTracking,
	stopCursorTracking,
} from '../../core/tests/mouse.ts';
import { sleepAndWaitForEffects } from '../../core/tests/utils.ts';

/**
 * Reads the live `style.translate` the core transform writes (`"<x>px <y>px"`), tolerating
 * an optional z-component, and returns the numeric offset. Parsing (rather than string match)
 * keeps the assertions robust to serialization differences across browsers.
 */
function readTranslate(el: HTMLElement): { x: number; y: number } {
	const raw = (el.style.translate || '').trim();
	if (!raw) return { x: 0, y: 0 };
	const [xs, ys] = raw.split(/\s+/);
	return { x: parseFloat(xs ?? '0'), y: parseFloat(ys ?? '0') };
}

function mount(node: () => unknown): { host: HTMLElement; dispose: () => void } {
	const host = document.createElement('div');
	document.body.appendChild(host);
	const dispose = render(node, host);
	return { host, dispose };
}

describe('@neodrag/solid v3 wrapper invariants', () => {
	beforeEach(() => {
		startCursorTracking();
	});

	afterEach(() => {
		stopCursorTracking();
	});

	// 1) Reactivity — a reactive option (axis) passed as a getter over a signal takes effect live
	//    via `.update()`, with no recreation: lock to x, drag diagonally → only x moves; flip the
	//    signal to y, drag again → only y moves.
	test('reactive axis getter changes take effect live (no recreation)', async () => {
		const [axis, setAxis] = createSignal<'x' | 'y'>('x');

		function Box() {
			const { ref } = createDraggable({
				get axis() {
					return axis();
				},
			});
			return (
				<div
					ref={ref}
					data-testid="draggable"
					style={{ width: '100px', height: '100px', background: 'cyan' }}
				/>
			);
		}

		const { host, dispose } = mount(() => <Box />);
		await sleepAndWaitForEffects();
		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;

		// axis = 'x' — diagonal drag, y is zeroed.
		await dragAndDrop(el, { deltaX: 40, deltaY: 25 }, { steps: 4 });
		await sleepAndWaitForEffects();
		const afterX = readTranslate(el);
		expect(afterX.x).toBeCloseTo(40, 0);
		expect(afterX.y).toBeCloseTo(0, 0);

		// Flip the reactive signal — pushes through createEffect → inst.update(), same instance.
		setAxis('y');
		await sleepAndWaitForEffects();

		// axis = 'y' is now live: the next diagonal drag is constrained to the y axis. The offset is
		// absolute (computed from the drag anchor), so `axis: 'y'` zeros the x component — proving
		// the element now moves ONLY on y (x locked to 0, y reflects the drag).
		await dragAndDrop(el, { deltaX: 30, deltaY: 20 }, { steps: 4 });
		await sleepAndWaitForEffects();
		const afterY = readTranslate(el);
		expect(afterY.x).toBeCloseTo(0, 0); // x locked by axis 'y'
		expect(afterY.y).toBeCloseTo(20, 0); // y free, reflects the drag

		dispose();
		host.remove();
	});

	// 2) Instance stability across updates — a reactive option change must `update()` in place, not
	//    recreate. The wrapper calls `new Draggable(...)` once at bind time; every reactive change
	//    flows through `createEffect` → `inst.update()`, never the constructor. We prove this two
	//    ways: (a) the drag's `start` event fires exactly once across the whole session despite
	//    several reactive option changes (a recreate would re-bind and could re-fire / reset), and
	//    (b) an in-progress drag (isDragging + accumulated offset) survives an unrelated reactive
	//    option change mid-session — the binding/session was not torn down.
	test('option changes update in place — single binding, drag survives change', async () => {
		let startCount = 0;
		const [grid, setGrid] = createSignal<[number, number] | undefined>(undefined);
		let lastIsDragging: (() => boolean) | null = null;

		function Box() {
			const { ref, isDragging } = createDraggable({
				get grid() {
					return grid();
				},
				onDragStart: () => {
					startCount++;
				},
			});
			lastIsDragging = isDragging;
			return (
				<div
					ref={ref}
					data-testid="draggable"
					style={{ width: '100px', height: '100px', background: 'magenta' }}
				/>
			);
		}

		const { host, dispose } = mount(() => <Box />);
		await sleepAndWaitForEffects();
		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;

		// Several reactive option changes BEFORE any drag — each runs createEffect → inst.update().
		setGrid([10, 10]);
		await sleepAndWaitForEffects();
		setGrid([5, 5]);
		await sleepAndWaitForEffects();
		setGrid(undefined);
		await sleepAndWaitForEffects();

		// Begin a drag and HOLD it (no pointerup) so we can mutate an option mid-session.
		const origin = await getElementCoords(el);
		dispatchPointer(el, 'pointermove', origin.x, origin.y, 0);
		await sleepAndWaitForEffects();
		dispatchPointer(el, 'pointerdown', origin.x, origin.y, 1);
		dispatchPointer(el, 'pointermove', origin.x + 20, origin.y + 15, 1);
		await sleepAndWaitForEffects();

		expect(lastIsDragging?.()).toBe(true); // session is live
		const midOffset = readTranslate(el);
		expect(midOffset.x).toBeCloseTo(20, 0);
		expect(midOffset.y).toBeCloseTo(15, 0);

		// Unrelated reactive option change MID-DRAG. If the wrapper recreated the instance it would
		// destroy() the live session and isDragging would drop / the offset would reset.
		setGrid([2, 2]);
		await sleepAndWaitForEffects();

		expect(lastIsDragging?.()).toBe(true); // drag survived the update

		// Continue the same drag — offset accumulates from where we were (same session/instance).
		dispatchPointer(el, 'pointermove', origin.x + 40, origin.y + 30, 1);
		await sleepAndWaitForEffects();
		const afterOffset = readTranslate(el);
		// grid [2,2] snaps 40/30 to the same values (both divisible by 2) — proves the live drag
		// continued and the new option is now in effect on the SAME instance.
		expect(afterOffset.x).toBeCloseTo(40, 0);
		expect(afterOffset.y).toBeCloseTo(30, 0);

		dispatchPointer(el, 'pointerup', origin.x + 40, origin.y + 30, 0);
		await sleepAndWaitForEffects();
		expect(lastIsDragging?.()).toBe(false);

		// Exactly one drag session ran start across the whole lifecycle. A recreate mid-drag would
		// have destroyed and (on the next pointerdown) re-bound, but here there was no re-bind.
		expect(startCount).toBe(1);

		dispose();
		host.remove();
	});

	// 3) No infinite loop on two-way position — a get/set position pair backed by a signal. The
	//    onDrag setter writes the live offset back into the same reactive state the getter reads.
	//    We assert: the test completes (no timeout), the bound state == final offset, the element's
	//    translate == the bound state, and onDrag fired a bounded number of times (≈ pointer moves).
	test('two-way position get/set does not loop and stays in sync', async () => {
		const [pos, setPos] = createSignal({ x: 0, y: 0 });
		let dragCalls = 0;

		function Box() {
			const { ref } = createDraggable({
				get position() {
					return pos();
				},
				set position(v: { x: number; y: number }) {
					setPos(v);
				},
				onDrag: (_e: DragEventData) => {
					dragCalls++;
				},
			});
			return (
				<div
					ref={ref}
					data-testid="draggable"
					style={{ width: '100px', height: '100px', background: 'gold' }}
				/>
			);
		}

		const { host, dispose } = mount(() => <Box />);
		await sleepAndWaitForEffects();
		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;

		const STEPS = 6;
		await dragAndDrop(el, { deltaX: 48, deltaY: 36 }, { steps: STEPS });
		await sleepAndWaitForEffects();

		// (a) Reaching here at all proves no infinite loop (the test did not hang/time out).
		// (b) The bound state was synced by the setter to the final offset.
		const final = pos();
		expect(final.x).toBeCloseTo(48, 0);
		expect(final.y).toBeCloseTo(36, 0);

		// (c) The element's translate matches the bound state.
		const tr = readTranslate(el);
		expect(tr.x).toBeCloseTo(final.x, 0);
		expect(tr.y).toBeCloseTo(final.y, 0);

		// (d) onDrag invocations are BOUNDED (proportional to pointer moves), not runaway. If the
		// position write-back re-triggered the move loop, the setter→effect→update→move cycle would
		// blow up into the hundreds/thousands. A small constant multiple of STEPS proves it stayed
		// linear in the number of pointer moves.
		expect(dragCalls).toBeGreaterThan(0);
		expect(dragCalls).toBeLessThanOrEqual(STEPS * 3);

		dispose();
		host.remove();
	});
});
