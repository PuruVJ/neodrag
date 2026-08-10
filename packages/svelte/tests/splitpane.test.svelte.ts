import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dragAndDrop, pointerDrag, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import { translate } from '../../core/tests/interactions/_browser.ts';
import SplitPaneHarness from './SplitPaneHarness.svelte';

const el = async (l: { element(): Element | Promise<Element> }) => (await l.element()) as HTMLElement;

// End-to-end through the Svelte wrapper: spreading container/pane/gutter attachments, dragging a
// gutter redistributes the neighbour panes (one grows, the other shrinks) and the gutter itself
// never translates — the flex layout repositions it.
describe('@neodrag/svelte SplitPane', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('panes start equal', async () => {
		const comp = render(SplitPaneHarness);
		await waitForEffects();
		expect(comp.component.sizes()).toEqual([1, 1]);
		const a = await el(comp.getByTestId('pane-0'));
		const b = await el(comp.getByTestId('pane-1'));
		expect(Math.round(a.getBoundingClientRect().width)).toBe(Math.round(b.getBoundingClientRect().width));
	});

	test('dragging the gutter right grows the left pane and shrinks the right', async () => {
		const comp = render(SplitPaneHarness);
		await waitForEffects();
		await dragAndDrop(comp.getByTestId('gutter-0'), { deltaX: 40, deltaY: 0 }, { steps: 6 });
		await waitForEffects();

		const [s0, s1] = comp.component.sizes();
		expect(s0).toBeGreaterThan(s1); // left grew, right shrank
		expect(s0 + s1).toBeCloseTo(2, 5); // budget conserved

		const a = await el(comp.getByTestId('pane-0'));
		const b = await el(comp.getByTestId('pane-1'));
		expect(a.getBoundingClientRect().width).toBeGreaterThan(b.getBoundingClientRect().width);
	});

	test('the gutter never translates (it stays anchored, layout moves it)', async () => {
		const comp = render(SplitPaneHarness);
		await waitForEffects();
		const gutter = await el(comp.getByTestId('gutter-0'));
		await pointerDrag(comp.getByTestId('gutter-0'), { deltaX: 40, deltaY: 0 }, { steps: 6, release: false });
		await waitForEffects();
		expect(translate(gutter)).toEqual({ x: 0, y: 0 }); // anchored — never offset by the drag
		// but the panes did redistribute
		expect(comp.component.sizes()[0]).toBeGreaterThan(1);
	});
	// (the per-pane minimum clamp is covered by the core controller unit test — pure math, no sim)
});
