import type { Locator } from '@vitest/browser/context';
import {
	dropOnto,
	edgePoint,
	humanDrag,
	humanDragAndDrop,
	keysFromList,
	moveToHuman,
	pointerDrag,
	pointerMoveTo,
	sortableReorder,
} from '@neodrag/test';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import InteractionsSplitBillGrouped from '../components/InteractionsSplitBillGrouped.svelte';
import { startCursorTracking, stopCursorTracking } from '../mouse.ts';
import { sleepAndWaitForEffects } from '../utils.ts';

type ItemId = 'latte' | 'salad' | 'cake';
type Owner = 'tray' | 'alex' | 'sam';
type TransferCapture = { phase: 'preview' | 'commit'; toIndex: number };

const RELEASE_MS = 280;

async function afterGesture() {
	await sleepAndWaitForEffects(RELEASE_MS);
}

function chip(comp: ReturnType<typeof render>, owner: Owner, id: ItemId) {
	return comp.getByTestId(`${owner}-chip-${id}`);
}

function hasNonZeroTranslate(transform: string) {
	return /translate(?:3d)?\([^)]+[^0]/.test(transform);
}

async function rowTransform(comp: ReturnType<typeof render>, owner: Owner, id: ItemId) {
	const el = (await chip(comp, owner, id).element()) as HTMLElement;
	const row = el.closest('[data-neodrag-sortable-row]') as HTMLElement | null;
	if (!row) return '';
	return row.style.transform || row.style.translate || '';
}

async function dropAtPoint(chip: Locator, point: { x: number; y: number }) {
	await humanDrag(chip).segments(moveToHuman(point)).mode('fast').run();
	await afterGesture();
}

async function dropOnZoneBottom(chip: Locator, zone: Locator, insetPx = 12) {
	const zoneEl = (await zone.element()) as HTMLElement;
	const pt = edgePoint(zoneEl.getBoundingClientRect(), 'bottom', insetPx);
	await dropAtPoint(chip, pt);
}

describe('split bill grouped commit (browser)', () => {
	beforeEach(() => {
		startCursorTracking();
	});

	afterEach(() => {
		stopCursorTracking();
	});

	test('commits tray reorder to last slot on drop (visual preview)', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const latte = chip(comp, 'tray', 'latte');

		await sortableReorder(latte, 2, tray, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'cake', 'latte']);
	});

	test('transfer uses foreign preview slot not release pointer for insert index', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			initialAlex: ['cake'],
			fastTransition: true,
		});
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const latte = chip(comp, 'tray', 'latte');
		const alexCake = chip(comp, 'alex', 'cake');

		await humanDragAndDrop(latte, alexCake, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(alex)).toEqual(['latte', 'cake']);
		expect(await keysFromList(tray)).toEqual(['salad']);
	});

	test('accepts a second chip on alex after the first transfer', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const alexZone = comp.getByTestId('alex-zone');
		const latte = chip(comp, 'tray', 'latte');
		const salad = chip(comp, 'tray', 'salad');

		await dropOnto(latte, alexZone, { mode: 'fast' });
		await afterGesture();
		expect(await keysFromList(alex)).toEqual(['latte']);
		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);

		await dropOnto(salad, alexZone, { mode: 'fast' });
		await afterGesture();
		expect(await keysFromList(alex)).toEqual(['salad', 'latte']);
		expect(await keysFromList(tray)).toEqual(['cake']);
	});

	test('keeps cake on alex when adding latte (no tray reorder commit)', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			initialAlex: ['cake'],
			fastTransition: true,
		});
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const latte = chip(comp, 'tray', 'latte');
		const alexCake = chip(comp, 'alex', 'cake');

		await humanDragAndDrop(latte, alexCake, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(alex)).toEqual(['latte', 'cake']);
		expect(await keysFromList(tray)).toEqual(['salad']);
	});

	test('does not restore tray order after successful transfer to alex', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const sam = comp.getByTestId('sam-list');
		const alexZone = comp.getByTestId('alex-zone');
		const latte = chip(comp, 'tray', 'latte');

		await dropOnto(latte, alexZone, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);
		expect(await keysFromList(alex)).toEqual(['latte']);
		expect(await keysFromList(sam)).toEqual([]);
	});

	test('transfers latte to alex when drag ends over alex column', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const latte = chip(comp, 'tray', 'latte');
		const alexZone = comp.getByTestId('alex-zone');

		await dropOnto(latte, alexZone, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);
		expect(await keysFromList(alex)).toEqual(['latte']);
	});

	test('transfers latte to sam when drag ends over sam column', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const sam = comp.getByTestId('sam-list');
		const latte = chip(comp, 'tray', 'latte');
		const samZone = comp.getByTestId('sam-zone');

		await dropOnto(latte, samZone, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);
		expect(await keysFromList(sam)).toEqual(['latte']);
	});

	test('displaces existing alex items while a tray chip hovers alex', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			initialAlex: ['cake'],
			fastTransition: true,
		});
		const latte = chip(comp, 'tray', 'latte');
		const alexZone = comp.getByTestId('alex-zone');
		const zoneEl = (await alexZone.element()) as HTMLElement;
		const hoverPt = edgePoint(zoneEl.getBoundingClientRect(), 'top', 16);

		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: false, steps: 1 });
		await pointerMoveTo(hoverPt.x, hoverPt.y, 12);
		await sleepAndWaitForEffects();

		expect(hasNonZeroTranslate(await rowTransform(comp, 'alex', 'cake'))).toBe(true);
		await pointerMoveTo(hoverPt.x, hoverPt.y, 1);
		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: true, steps: 1 });
	});

	test('keeps cake displacement stable when hovering before vs after it on alex', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			initialAlex: ['cake'],
			fastTransition: true,
		});
		const latte = chip(comp, 'tray', 'latte');
		const alexCake = chip(comp, 'alex', 'cake');
		const cakeRect = (await alexCake.element()).getBoundingClientRect();
		const beforePt = {
			x: cakeRect.left - 8,
			y: cakeRect.top + cakeRect.height / 2,
		};
		const afterPt = {
			x: cakeRect.right + 8,
			y: cakeRect.top + cakeRect.height / 2,
		};

		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: false, steps: 1 });
		await pointerMoveTo(beforePt.x, beforePt.y, 12);
		await sleepAndWaitForEffects();
		const before = await rowTransform(comp, 'alex', 'cake');
		await pointerMoveTo(afterPt.x, afterPt.y, 12);
		await sleepAndWaitForEffects();
		const after = await rowTransform(comp, 'alex', 'cake');

		expect(hasNonZeroTranslate(before)).toBe(true);
		expect(hasNonZeroTranslate(after)).toBe(false);
		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: true, steps: 1 });
	});

	test('transfers to sam when dropped in bottom padding of the column', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			initialSam: ['cake'],
			fastTransition: true,
		});
		const tray = comp.getByTestId('tray-list');
		const sam = comp.getByTestId('sam-list');
		const latte = chip(comp, 'tray', 'latte');
		const samZone = comp.getByTestId('sam-zone');

		await dropOnZoneBottom(latte, samZone);
		expect(await keysFromList(sam)).toEqual(['cake', 'latte']);
		expect(await keysFromList(tray)).toEqual(['salad']);
	});

	test('transfers to empty sam column when dropped at column bottom', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const sam = comp.getByTestId('sam-list');
		const latte = chip(comp, 'tray', 'latte');
		const samZone = comp.getByTestId('sam-zone');

		await dropOnZoneBottom(latte, samZone);
		expect(await keysFromList(sam)).toEqual(['latte']);
		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);
	});

	test('transfers from alex to sam within the group', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			initialAlex: ['cake'],
			fastTransition: true,
		});
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const sam = comp.getByTestId('sam-list');
		const alexCake = chip(comp, 'alex', 'cake');
		const samZone = comp.getByTestId('sam-zone');

		await dropOnto(alexCake, samZone, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(alex)).toEqual([]);
		expect(await keysFromList(sam)).toEqual(['cake']);
		expect(await keysFromList(tray)).toEqual(['latte', 'salad']);
	});

	test('does not commit tray reorder when releasing over a friend column', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const tray = comp.getByTestId('tray-list');
		const alexZone = comp.getByTestId('alex-zone');
		const latte = chip(comp, 'tray', 'latte');

		await dropOnto(latte, alexZone, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);
		expect(await keysFromList(tray)).not.toEqual(['salad', 'cake', 'latte']);
	});

	test('fires onTransfer preview while hovering a friend column and commit on drop', async () => {
		const transfers: TransferCapture[] = [];
		const comp = render(InteractionsSplitBillGrouped, {
			fastTransition: true,
			onTransfer: (meta) => transfers.push(meta),
		});
		const alexZone = comp.getByTestId('alex-zone');
		const latte = chip(comp, 'tray', 'latte');
		const zoneEl = (await alexZone.element()) as HTMLElement;
		const hoverPt = edgePoint(zoneEl.getBoundingClientRect(), 'top', 16);
		const latteEl = (await latte.element()) as HTMLElement;
		const home = latteEl.getBoundingClientRect();
		const homePt = {
			x: home.left + home.width / 2,
			y: home.top + home.height / 2,
		};

		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: false, steps: 1 });
		await pointerMoveTo(hoverPt.x, hoverPt.y, 14);
		await sleepAndWaitForEffects();
		expect(transfers.some((t) => t.phase === 'preview' && t.toIndex >= 0)).toBe(true);
		expect(transfers.some((t) => t.phase === 'commit')).toBe(false);

		await pointerMoveTo(homePt.x, homePt.y, 10);
		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: true, steps: 1 });
		await sleepAndWaitForEffects();
		expect(transfers.some((t) => t.phase === 'commit')).toBe(false);

		await dropOnto(latte, alexZone, { mode: 'fast' });
		await afterGesture();
		expect(transfers.some((t) => t.phase === 'commit' && t.toIndex >= 0)).toBe(true);
	});

	test('freezes source sibling layout during foreign hover by default', async () => {
		const comp = render(InteractionsSplitBillGrouped, { fastTransition: true });
		const latte = chip(comp, 'tray', 'latte');
		const alexZone = comp.getByTestId('alex-zone');
		const zoneEl = (await alexZone.element()) as HTMLElement;
		const hoverPt = edgePoint(zoneEl.getBoundingClientRect(), 'top', 16);

		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: false, steps: 1 });
		await pointerMoveTo(hoverPt.x, hoverPt.y, 14);
		await sleepAndWaitForEffects();

		expect(hasNonZeroTranslate(await rowTransform(comp, 'tray', 'salad'))).toBe(false);
		expect(hasNonZeroTranslate(await rowTransform(comp, 'tray', 'cake'))).toBe(false);
		await pointerDrag(latte, { deltaX: 0, deltaY: 0 }, { release: true, steps: 1 });
	});

	test('commits transfer when groupSourcePreview is reflow', async () => {
		const comp = render(InteractionsSplitBillGrouped, {
			groupSourcePreview: 'reflow',
			fastTransition: true,
		});
		const tray = comp.getByTestId('tray-list');
		const alex = comp.getByTestId('alex-list');
		const alexZone = comp.getByTestId('alex-zone');
		const latte = chip(comp, 'tray', 'latte');

		await dropOnto(latte, alexZone, { mode: 'fast' });
		await afterGesture();

		expect(await keysFromList(alex)).toEqual(['latte']);
		expect(await keysFromList(tray)).toEqual(['salad', 'cake']);
	});
});
