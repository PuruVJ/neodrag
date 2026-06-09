/**
 * Real-browser regression suite for the sortable fixes that the old jsdom test could not catch
 * (it mocked every getBoundingClientRect). Drives the actual Svelte wrapper so the FLIP / transfer
 * paths run through a real framework re-render, against real layout + real Web Animations.
 */
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	getElementCoords,
	pointerDrag,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import KanbanHarness from './KanbanHarness.svelte';
import SortableHarness from './SortableHarness.svelte';

const el = async (locator: { element(): Element | Promise<Element> }) =>
	(await locator.element()) as HTMLElement;

describe('@neodrag/svelte sortable — real-browser regressions', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('reorder commits and leaves no stuck transforms (FLIP path)', async () => {
		const comp = render(SortableHarness);
		await waitForEffects();
		// drag `a` (top) down past b + c, drop → order becomes b,c,a
		await pointerDrag(comp.getByTestId('row-a'), { deltaX: 0, deltaY: 90 }, { steps: 8 });
		await waitForEffects();
		await waitForEffects();
		expect(comp.component.order()).toEqual(['b', 'c', 'a']);
		for (const id of ['a', 'b', 'c']) {
			expect((await el(comp.getByTestId(`row-${id}`))).style.translate).toBe('');
		}
	});

	test('dropping in place fires no reorder', async () => {
		const comp = render(SortableHarness);
		await waitForEffects();
		// nudge `a` a few px (not past b's midpoint) and drop → no commit
		await pointerDrag(comp.getByTestId('row-a'), { deltaX: 0, deltaY: 8 }, { steps: 3 });
		await waitForEffects();
		expect(comp.component.order()).toEqual(['a', 'b', 'c']);
		expect(comp.component.reorderCount()).toBe(0);
	});

	test('during-drag sibling displacement is eased; the dragged node is not', async () => {
		const comp = render(SortableHarness);
		await waitForEffects();
		// grab `a`, move down ~one slot so `b` opens a gap; hold
		await pointerDrag(comp.getByTestId('row-a'), { deltaX: 0, deltaY: 45 }, { steps: 6, release: false });
		await waitForEffects();
		const b = await el(comp.getByTestId('row-b'));
		const a = await el(comp.getByTestId('row-a'));
		expect(b.style.transition).toContain('translate'); // eased
		expect(a.style.transition).not.toContain('translate'); // dragged node tracks instantly
		expect(b.style.translate).toBe('0px -40px'); // shifted up to open the gap
		await pointerRelease();
	});

	test("indicator:'line' — no displacement, draws a drop-line + ghost, still commits", async () => {
		const comp = render(SortableHarness);
		comp.component.setIndicator('line');
		await waitForEffects();
		// grab a, move down ~one slot; hold
		await pointerDrag(comp.getByTestId('row-a'), { deltaX: 0, deltaY: 45 }, { steps: 6, release: false });
		await waitForEffects();
		// siblings DON'T move in line mode
		expect((await el(comp.getByTestId('row-b'))).style.translate).toBe('');
		// the engine drew a drop-line and a dimmed origin ghost
		expect(document.querySelector('[data-neodrag-sortable-indicator]')).not.toBeNull();
		expect(document.querySelector('[data-neodrag-sortable-ghost]')).not.toBeNull();
		// finish a full move and drop → reorder still commits, line + ghost cleaned up
		await pointerRelease();
		await waitForEffects();
		expect(document.querySelector('[data-neodrag-sortable-indicator]')).toBeNull();
		expect(document.querySelector('[data-neodrag-sortable-ghost]')).toBeNull();
	});

	test('collapse-source: leaving for a foreign list closes the grabbed slot', async () => {
		const comp = render(KanbanHarness);
		await waitForEffects();
		// move a0 into list B (to the right); hold
		await pointerDrag(comp.getByTestId('row-a0'), { deltaX: 200, deltaY: 0 }, { steps: 10, release: false });
		await waitForEffects();
		// a1 slides UP to fill a0's slot — not back behind it
		expect((await el(comp.getByTestId('row-a1'))).style.translate).toBe('0px -40px');
		await pointerRelease();
	});

	test('foreign-gap: hovering a populated list opens a slot', async () => {
		const comp = render(KanbanHarness);
		await waitForEffects();
		const a0c = await getElementCoords(comp.getByTestId('row-a0'));
		const b0c = await getElementCoords(comp.getByTestId('row-b0'));
		// move a0 to just above b0 (insert at front of B); hold
		await pointerDrag(
			comp.getByTestId('row-a0'),
			{ deltaX: b0c.x - a0c.x, deltaY: b0c.y - 18 - a0c.y },
			{ steps: 10, release: false },
		);
		await waitForEffects();
		// b0 shifts down a slot to open the gap
		expect((await el(comp.getByTestId('row-b0'))).style.translate).toBe('0px 40px');
		await pointerRelease();
	});

	test('accepts:false rejects the transfer — no gap, item stays', async () => {
		const comp = render(KanbanHarness);
		comp.component.setAcceptsB(false);
		await waitForEffects();
		const a0c = await getElementCoords(comp.getByTestId('row-a0'));
		const b0c = await getElementCoords(comp.getByTestId('row-b0'));
		await pointerDrag(
			comp.getByTestId('row-a0'),
			{ deltaX: b0c.x - a0c.x, deltaY: b0c.y - a0c.y },
			{ steps: 10, release: false },
		);
		await waitForEffects();
		expect((await el(comp.getByTestId('row-b0'))).style.translate).toBe(''); // B not displaced
		await pointerRelease();
		await waitForEffects();
		expect(comp.component.orderA()).toEqual(['a0', 'a1']);
		expect(comp.component.orderB()).toEqual(['b0', 'b1']);
		expect(comp.component.lastTransferOp()).toBe(null);
	});

	test('grouped drag elevates the source list; restored on drop', async () => {
		const comp = render(KanbanHarness);
		await waitForEffects();
		await pointerDrag(comp.getByTestId('row-a0'), { deltaX: 30, deltaY: 30 }, { steps: 4, release: false });
		await waitForEffects();
		const listA = await el(comp.getByTestId('listA'));
		expect(listA.hasAttribute('data-neodrag-sortable-elevated-source')).toBe(true);
		expect(listA.style.zIndex).not.toBe('');
		await pointerRelease();
		await waitForEffects();
		expect(listA.hasAttribute('data-neodrag-sortable-elevated-source')).toBe(false);
		expect(listA.style.zIndex).toBe('');
	});

	test('cross-list transfer moves the item between lists', async () => {
		const comp = render(KanbanHarness);
		await waitForEffects();
		const a0c = await getElementCoords(comp.getByTestId('row-a0'));
		const b0c = await getElementCoords(comp.getByTestId('row-b0'));
		await pointerDrag(
			comp.getByTestId('row-a0'),
			{ deltaX: b0c.x - a0c.x, deltaY: b0c.y - 18 - a0c.y },
			{ steps: 12 },
		);
		await waitForEffects();
		await waitForEffects();
		expect(comp.component.orderA()).toEqual(['a1']);
		expect(comp.component.orderB()).toContain('a0');
		expect(comp.component.lastTransferOp()).toBe('a0->b');
	});
});
