import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerMoveTo,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../../core/tests/mouse.ts';
import { sleepAndWaitForEffects, translate } from '../../core/tests/utils.ts';
import InvariantsHarness from './InvariantsHarness.svelte';
import PositionHarness from './PositionHarness.svelte';

// Three invariants of the class-based Svelte 5 wrapper (`new Draggable(options)` → `{ attach,
// isDragging }`, reactive options as getters over `$state`):
//   1. Reactivity — a reactive option change applies live, without recreating the binding.
//   2. Instance stability — an option change is an in-place `update()`, not a teardown/re-attach;
//      an in-flight drag (and its `isDragging`) survives an unrelated reactive option change.
//   3. No infinite loop on two-way `position` — the get/set pair syncs the offset without runaway.
describe('@neodrag/svelte v3 wrapper invariants', () => {
	beforeEach(() => {
		startCursorTracking();
	});

	afterEach(() => {
		stopCursorTracking();
	});

	// 1. Reactivity: start axis-locked to 'x', drag diagonally → only x moves (40, 0). Flip the
	// reactive axis to 'y' on the SAME instance, drag diagonally again → now only y moves (0, 30).
	// Each drag starts from offset (0,0) (no `position` option), so the second result isolates the
	// freed axis: x dropped, y kept — proving the axis flip took effect live, not at recreate time.
	test('reactive `axis` change applies live without recreating', async () => {
		const comp = render(InvariantsHarness);
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();

		comp.component.setAxis('x');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveAttribute('data-axis', 'x');

		// Diagonal drag while locked to x → y component is dropped.
		await dragAndDrop(el, { deltaX: 40, deltaY: 30 }, { steps: 5 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(40, 0));

		// Flip the reactive axis to 'y' — the binding must update in place.
		comp.component.setAxis('y');
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveAttribute('data-axis', 'y');

		// Diagonal drag while now locked to y → x is dropped, y picks up the 30.
		await dragAndDrop(el, { deltaX: 40, deltaY: 30 }, { steps: 5 });
		await sleepAndWaitForEffects();
		await expect.element(el).toHaveStyle(translate(0, 30));
	});

	// 2. Instance stability: a reactive option change must be an in-place `update()`, never a
	// destroy + re-create. Proven two ways without mocking the core constructor:
	//   (a) the SAME DOM node stays attached across several reactive option changes, and
	//   (b) an in-flight drag — `isDragging === true`, pointer still held — survives an unrelated
	//       reactive option change. A teardown/re-attach would reset `isDragging` and drop the
	//       capture, so survival proves the underlying core instance was preserved.
	test('option changes update in place; in-flight drag survives a reactive change', async () => {
		const comp = render(InvariantsHarness);
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();

		const nodeBefore = await el.element();

		// Several reactive option changes — none should re-attach (same node identity).
		comp.component.setAxis('x');
		await sleepAndWaitForEffects();
		comp.component.setAxis('y');
		await sleepAndWaitForEffects();
		comp.component.setAxis('both');
		await sleepAndWaitForEffects();

		const nodeAfter = await el.element();
		expect(nodeAfter).toBe(nodeBefore);

		// Begin a drag and HOLD the pointer down (no release) → mid-flight state.
		const end = await pointerDrag(el, { deltaX: 30, deltaY: 30 }, { steps: 4, release: false });
		await sleepAndWaitForEffects();
		expect(comp.component.getIsDragging()).toBe(true);

		// Flip an unrelated reactive option WHILE the drag is live. An in-place update keeps the
		// session (and pointer capture) intact; a re-create would tear it down.
		comp.component.setAxis('x');
		await sleepAndWaitForEffects();
		expect(comp.component.getIsDragging()).toBe(true);
		expect(await el.element()).toBe(nodeBefore);

		// The held drag is still drivable — moving the pointer keeps reporting offsets.
		const countMid = comp.component.getDragCount();
		await pointerMoveTo(end.x + 10, end.y + 10, 2);
		await sleepAndWaitForEffects();
		expect(comp.component.getDragCount()).toBeGreaterThan(countMid);

		await pointerRelease();
		await sleepAndWaitForEffects();
		expect(comp.component.getIsDragging()).toBe(false);
	});

	// 3. No infinite loop on two-way `position`: `{ get position() { return pos }, set position(v)
	// { pos = v } }` backed by `$state`. The wrapper writes the setter on every move; the setter
	// mutating reactive state must not re-feed the getter into a loop. Proof: the test completes
	// (no timeout), `pos` equals the final offset, the element's translate matches `pos`, and the
	// drag callback count stays bounded (~ pointer moves, not runaway).
	test('two-way `position` syncs without an infinite loop', async () => {
		const comp = render(PositionHarness);
		const el = comp.getByTestId('draggable');
		await sleepAndWaitForEffects();

		const steps = 6;
		await dragAndDrop(el, { deltaX: 50, deltaY: 35 }, { steps });
		await sleepAndWaitForEffects();

		// (b) the bound state was synced to the final offset by the setter.
		const pos = comp.component.getPos();
		expect(pos).toEqual({ x: 50, y: 35 });

		// (c) the element's translate matches the bound position.
		await expect.element(el).toHaveStyle(translate(50, 35));

		// (a) — implicit: reaching here without a Vitest timeout is the no-infinite-loop proof.
		// Bound check on callback invocations: bounded by the pointer moves, not runaway. The drag
		// helper dispatches each `pointermove` to both the node and `document.documentElement`, so
		// `onDrag` fires ~2× per step — still O(steps). An infinite loop would inflate this by
		// orders of magnitude, so a generous 2×steps ceiling still catches runaway re-entrancy.
		const dragCount = comp.component.getDragCount();
		expect(dragCount).toBeGreaterThan(0);
		expect(dragCount).toBeLessThanOrEqual(2 * steps + 4);
	});
});
