import type { Locator } from '@vitest/browser/context';
import { afterEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSortableBackdrop from '../components/InteractionsSortableBackdrop.svelte';
import InteractionsSortableHorizontal from '../components/InteractionsSortableHorizontal.svelte';
import InteractionsSortableHorizontalState from '../components/InteractionsSortableHorizontalState.svelte';
import {
	dragAndDrop,
	pointerDrag,
	pointerMoveTo,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../mouse.ts';
import { sleep, waitForEffects } from '../utils.ts';

const RELEASE_MS = 250;

async function transformX(locator: Locator) {
	const el = await locator.element();
	const raw = getComputedStyle(el).transform;
	if (!raw || raw === 'none') return 0;
	return new DOMMatrix(raw).m41;
}

async function isFixed(locator: Locator) {
	return getComputedStyle(await locator.element()).position === 'fixed';
}

async function keysFromList(list: Locator) {
	const el = await list.element();
	return [...el.querySelectorAll('[data-sortable-key]')].map((node) =>
		node.getAttribute('data-sortable-key'),
	);
}

async function dragChipTo(
	chip: Locator,
	target: Locator,
	placement: 'before' | 'after' = 'after',
) {
	const chipEl = await chip.element();
	const targetEl = await target.element();
	const chipRect = chipEl.getBoundingClientRect();
	const targetRect = targetEl.getBoundingClientRect();
	const targetX =
		placement === 'before' ? targetRect.left + 4 : targetRect.left + targetRect.width - 4;
	await dragAndDrop(
		chip,
		{
			deltaX: targetX - (chipRect.left + chipRect.width / 2),
			deltaY: 0,
		},
		{ steps: 16 },
	);
	await sleep(RELEASE_MS);
	await waitForEffects();
}

// Browser coverage for horizontal sortable regressions:
// - visual preview: DOM order frozen until release; releaseDuration + drop-before-end
// - pre-lift sibling hold on drag start; middle vs end slot shift magnitudes
// - state preview: live DOM reorder; snapshot/mids stay in sync through drag
// - collision nudges, second-drag fresh mids, insert-before vs after placement
describe('sortable horizontal', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('state preview reorders DOM while dragging before release', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontalState);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const charlie = comp.getByTestId('chip-charlie');

		const alphaEl = await alpha.element();
		const charlieEl = await charlie.element();
		const alphaRect = alphaEl.getBoundingClientRect();
		const charlieRect = charlieEl.getBoundingClientRect();

		const targetX = charlieRect.left + charlieRect.width - 4;
		await dragAndDrop(
			alpha,
			{
				deltaX: targetX - (alphaRect.left + alphaRect.width / 2),
				deltaY: 0,
			},
			{ steps: 16 },
		);
		await sleep(RELEASE_MS);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);
		stopCursorTracking();
	});

	test('reorders on first drag using horizontal collision', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const charlie = comp.getByTestId('chip-charlie');

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);

		await dragChipTo(alpha, charlie);

		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);
	});

	test('second drag in same list uses fresh mids (no stale vertical shuffle)', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');
		const charlie = comp.getByTestId('chip-charlie');

		await dragChipTo(alpha, charlie);
		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);

		await dragChipTo(alpha, bravo, 'before');
		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
	});

	test('small nudge left on middle chip does not jump to end', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const salad = comp.getByTestId('chip-bravo');
		const latte = comp.getByTestId('chip-alpha');

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);

		const saladEl = await salad.element();
		const latteEl = await latte.element();
		const saladRect = saladEl.getBoundingClientRect();
		const latteRect = latteEl.getBoundingClientRect();
		const nudgeX = saladRect.left - (saladRect.left - latteRect.right) * 0.35;

		await dragAndDrop(
			salad,
			{ deltaX: nudgeX - (saladRect.left + saladRect.width / 2), deltaY: 0 },
			{ steps: 12 },
		);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
		stopCursorTracking();
	});

	test('small nudge right on middle chip stays in place', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const salad = comp.getByTestId('chip-bravo');
		const cake = comp.getByTestId('chip-charlie');

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);

		const saladEl = await salad.element();
		const cakeEl = await cake.element();
		const saladRect = saladEl.getBoundingClientRect();
		const cakeRect = cakeEl.getBoundingClientRect();
		const nudgeX = saladRect.left + (cakeRect.left - saladRect.left) * 0.55;

		await dragAndDrop(
			salad,
			{ deltaX: nudgeX - (saladRect.left + saladRect.width / 2), deltaY: 0 },
			{ steps: 12 },
		);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
		stopCursorTracking();
	});

	test('drag past right neighbor center reorders to the right', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const salad = comp.getByTestId('chip-bravo');
		const cake = comp.getByTestId('chip-charlie');

		await dragChipTo(salad, cake, 'after');
		expect(await keysFromList(list)).toEqual(['alpha', 'charlie', 'bravo']);
	});

	test('drag past left neighbor center reorders to the left', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const salad = comp.getByTestId('chip-bravo');
		const latte = comp.getByTestId('chip-alpha');

		await dragChipTo(salad, latte, 'before');
		expect(await keysFromList(list)).toEqual(['bravo', 'alpha', 'charlie']);
	});

	test('visual preview keeps DOM order until release', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const charlie = comp.getByTestId('chip-charlie');

		const alphaEl = await alpha.element();
		const charlieEl = await charlie.element();
		const alphaRect = alphaEl.getBoundingClientRect();
		const charlieRect = charlieEl.getBoundingClientRect();

		const targetX = charlieRect.left + charlieRect.width - 4;
		const end = await pointerDrag(
			alpha,
			{
				deltaX: targetX - (alphaRect.left + alphaRect.width / 2),
				deltaY: 0,
			},
			{ steps: 16, release: false },
		);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);
	});

	test('noop drop after small nudge keeps order without sibling snap', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');

		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);

		const alphaEl = await alpha.element();
		const alphaRect = alphaEl.getBoundingClientRect();
		const end = await pointerDrag(alpha, { deltaX: 6, deltaY: 0 }, { steps: 3, release: false });
		await waitForEffects();
		expect(Math.abs(await transformX(bravo))).toBeLessThan(4);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
		expect(Math.abs(await transformX(bravo))).toBeLessThan(4);
	});

	test('middle chip stays aligned with pointer during transform drag', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const bravo = comp.getByTestId('chip-bravo');

		const end = await pointerDrag(bravo, { deltaX: 10, deltaY: 0 }, { steps: 4, release: false });
		await waitForEffects();

		const bravoEl = await bravo.element();
		const rect = bravoEl.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		expect(Math.abs(centerX - end.x)).toBeLessThan(10);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
	});

	test('regression: second drag on same chip has no stale offset jump', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const alpha = comp.getByTestId('chip-alpha');

		await dragAndDrop(alpha, { deltaX: 8, deltaY: 0 }, { steps: 4 });
		await sleep(RELEASE_MS);
		await waitForEffects();

		const end = await pointerDrag(alpha, { deltaX: 12, deltaY: 8 }, { steps: 4, release: false });
		await waitForEffects();

		const alphaEl = await alpha.element();
		const rect = alphaEl.getBoundingClientRect();
		expect(Math.abs(rect.left + rect.width / 2 - end.x)).toBeLessThan(24);
		expect(Math.abs(rect.top + rect.height / 2 - end.y)).toBeLessThan(24);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
	});

	test('regression: third chip stays under pointer inside backdrop-filter ancestor', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableBackdrop);
		const charlie = comp.getByTestId('chip-charlie');

		const end = await pointerDrag(charlie, { deltaX: 12, deltaY: 12 }, { steps: 4, release: false });
		await waitForEffects();

		const charlieEl = await charlie.element();
		const rect = charlieEl.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		expect(Math.abs(centerX - end.x)).toBeLessThan(12);
		expect(Math.abs(centerY - end.y)).toBeLessThan(12);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
	});

	test('last chip first drag aligned with flex-wrap and release animation', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal, { releaseDuration: 220 });
		const charlie = comp.getByTestId('chip-charlie');

		const beforeLeft = (await charlie.element()).getBoundingClientRect().left;
		const end = await pointerDrag(charlie, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const afterLeft = (await charlie.element()).getBoundingClientRect().left;
		expect(Math.abs(afterLeft - beforeLeft)).toBeLessThan(8);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('last chip drag start stays aligned after animated release reorder', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal, { releaseDuration: 220 });
		const alpha = comp.getByTestId('chip-alpha');
		const charlie = comp.getByTestId('chip-charlie');

		await dragChipTo(alpha, charlie);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await transformX(charlie)).toBe(0);

		const charlieEl = await charlie.element();
		const beforeLeft = charlieEl.getBoundingClientRect().left;
		const end = await pointerDrag(charlie, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const afterEl = await charlie.element();
		const afterLeft = afterEl.getBoundingClientRect().left;
		const centerX = afterLeft + afterEl.getBoundingClientRect().width / 2;
		expect(Math.abs(afterLeft - beforeLeft)).toBeLessThan(8);
		expect(Math.abs(centerX - end.x)).toBeLessThan(12);
		expect(await transformX(charlie)).toBeLessThan(4);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await transformX(charlie)).toBe(0);
		stopCursorTracking();
	});

	test('first chip has no vertical screen jump on drag start with row min-height', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const alpha = comp.getByTestId('chip-alpha');

		const alphaEl = await alpha.element();
		const beforeTop = alphaEl.getBoundingClientRect().top;
		const end = await pointerDrag(alpha, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const afterTop = (await alpha.element()).getBoundingClientRect().top;
		expect(Math.abs(afterTop - beforeTop)).toBeLessThan(14);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
	});

	test('drag start applies in-flow transforms without fixed lift', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');
		const charlie = comp.getByTestId('chip-charlie');

		const alphaEl = await alpha.element();
		const alphaRect = alphaEl.getBoundingClientRect();
		await pointerDrag(alpha, { deltaX: 4, deltaY: 0 }, { steps: 2, release: false });
		await waitForEffects();

		const listEl = await list.element();
		expect(listEl.hasAttribute('data-sortable-dragging')).toBe(true);
		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
		expect(await isFixed(alpha)).toBe(false);
		expect(Math.abs(await transformX(bravo))).toBeLessThan(4);
		expect(Math.abs(await transformX(charlie))).toBeLessThan(4);

		await pointerRelease(alphaRect.left + 4, alphaRect.top);
		await sleep(RELEASE_MS);
		await waitForEffects();
	});

	test('over middle slot keeps DOM order; end slot shifts third chip more than middle', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');
		const charlie = comp.getByTestId('chip-charlie');

		const alphaEl = await alpha.element();
		const bravoEl = await bravo.element();
		const charlieEl = await charlie.element();
		const alphaRect = alphaEl.getBoundingClientRect();
		const bravoRect = bravoEl.getBoundingClientRect();
		const charlieRect = charlieEl.getBoundingClientRect();

		const overBravoX = bravoRect.left + bravoRect.width / 2;
		const end = await pointerDrag(
			alpha,
			{ deltaX: overBravoX - (alphaRect.left + alphaRect.width / 2), deltaY: 0 },
			{ steps: 16, release: false },
		);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
		const gapOverBravo = Math.abs(await transformX(bravo));

		const overCharlieX = charlieRect.left + charlieRect.width - 4;
		await pointerMoveTo(overCharlieX, end.y, 8);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['alpha', 'bravo', 'charlie']);
		const gapOverCharlie = Math.abs(await transformX(charlie));
		expect(gapOverBravo).toBeLessThan(gapOverCharlie + 1);

		await pointerRelease(overCharlieX, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);
	});

	test('drop on middle slot commits after release animation', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');

		await dragChipTo(alpha, bravo, 'after');

		expect(await keysFromList(list)).toEqual(['bravo', 'alpha', 'charlie']);
	});

	test('state preview shifts order while pointer moves before release', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontalState);
		const list = comp.getByTestId('list');
		const alpha = comp.getByTestId('chip-alpha');
		const charlie = comp.getByTestId('chip-charlie');

		const alphaEl = await alpha.element();
		const charlieEl = await charlie.element();
		const alphaRect = alphaEl.getBoundingClientRect();
		const charlieRect = charlieEl.getBoundingClientRect();

		const targetX = charlieRect.left + charlieRect.width - 4;
		const end = await pointerDrag(
			alpha,
			{
				deltaX: targetX - (alphaRect.left + alphaRect.width / 2),
				deltaY: 0,
			},
			{ steps: 16, release: false },
		);
		await waitForEffects();

		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);

		await pointerRelease(end.x, end.y);
		await sleep(RELEASE_MS);
		await waitForEffects();
		expect(await keysFromList(list)).toEqual(['bravo', 'charlie', 'alpha']);
	});
});

describe('sortable horizontal transform release', () => {
	afterEach(() => {
		stopCursorTracking();
	});

	test('visual preview does not use position fixed on items', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');

		await pointerDrag(alpha, { deltaX: 8, deltaY: 0 }, { steps: 3, release: false });
		await waitForEffects();

		expect(await isFixed(alpha)).toBe(false);
		expect(await isFixed(bravo)).toBe(false);

		await pointerRelease((await alpha.element()).getBoundingClientRect().right, 0);
		await sleep(RELEASE_MS);
		await waitForEffects();
		stopCursorTracking();
	});

	test('clears sibling transforms after drop', async () => {
		startCursorTracking();
		const comp = render(InteractionsSortableHorizontal);
		const alpha = comp.getByTestId('chip-alpha');
		const bravo = comp.getByTestId('chip-bravo');
		const charlie = comp.getByTestId('chip-charlie');

		await dragChipTo(alpha, charlie);
		expect(Math.abs(await transformX(bravo))).toBeLessThan(2);
		expect(Math.abs(await transformX(charlie))).toBeLessThan(2);
		stopCursorTracking();
	});
});
