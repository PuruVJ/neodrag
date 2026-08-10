import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { pointerDrag, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import PanZoomCollabHarness from './PanZoomCollabHarness.svelte';

const el = async (l: { element(): Element | Promise<Element> }) => (await l.element()) as HTMLElement;

// End-to-end: two PanZoom instances share a paired in-memory room. A pan on A must sync to B —
// exercising the binder's room.add wiring + the controller's commit/applyExternal path.
describe('@neodrag/svelte PanZoom collab (shared canvas)', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('panning canvas A moves canvas B to the same transform', async () => {
		const comp = render(PanZoomCollabHarness);
		await waitForEffects();
		const aVp = await el(comp.getByTestId('a-vp'));
		const bWorld = await el(comp.getByTestId('b-world'));

		await pointerDrag(aVp, { deltaX: 60, deltaY: 30 }); // releases → commits the panzoom op
		await waitForEffects();

		expect(comp.component.peerTransform()).toEqual({ x: 60, y: 30, scale: 1 });
		expect(bWorld.style.transform).toContain('translate(60px, 30px)');
	});
});
