import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { dispatchPointer, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import PanZoomHarness from './PanZoomHarness.svelte';

const el = async (l: { element(): Element | Promise<Element> }) => (await l.element()) as HTMLElement;

// End-to-end through the engine: the viewport is a Draggable running the `pan` plugin, so panning is
// driven with real pointer events the engine's sensors pick up. Zoom is the wrapper's wheel handler.
describe('@neodrag/svelte PanZoom (engine-driven)', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('dragging the viewport pans the world 1:1 with the pointer', async () => {
		const comp = render(PanZoomHarness);
		await waitForEffects();
		const vp = await el(comp.getByTestId('viewport'));
		const b = vp.getBoundingClientRect();
		const at = (x: number, y: number) => [b.left + x, b.top + y] as const;

		dispatchPointer(vp, 'pointerdown', ...at(150, 100), 1);
		dispatchPointer(vp, 'pointermove', ...at(210, 130), 1);
		await waitForEffects();
		const t = comp.component.transform();
		expect(t.x).toBeCloseTo(60, 0);
		expect(t.y).toBeCloseTo(30, 0);

		// The world layer got the translate; the viewport itself never moved. The `pan` plugin returns
		// {0,0}, so the engine writes a zero translate on the viewport (not an absent one).
		const world = await el(comp.getByTestId('world'));
		expect(world.style.transform).toContain('translate(60px, 30px)');
		expect(['', 'none', '0px', '0px 0px']).toContain(vp.style.translate);

		dispatchPointer(vp, 'pointerup', ...at(210, 130), 0);
	});

	test('wheel zooms toward the cursor, keeping that point fixed', async () => {
		const comp = render(PanZoomHarness);
		await waitForEffects();
		const vp = await el(comp.getByTestId('viewport'));
		const b = vp.getBoundingClientRect();
		const [cx, cy] = [150, 100]; // viewport-local focus

		vp.dispatchEvent(
			new WheelEvent('wheel', { deltaY: -120, clientX: b.left + cx, clientY: b.top + cy, bubbles: true, cancelable: true }),
		);
		await waitForEffects();
		const t = comp.component.transform();
		expect(t.scale).toBeGreaterThan(1);
		// The world point under (cx, cy) before zoom must still sit there after.
		expect((cx - t.x) / t.scale).toBeCloseTo(cx, 4);
		expect((cy - t.y) / t.scale).toBeCloseTo(cy, 4);
	});

	test('zoomTo and reset drive the transform programmatically', async () => {
		const comp = render(PanZoomHarness);
		await waitForEffects();
		comp.component.api.zoomTo(3); // default focus = viewport center
		await waitForEffects();
		expect(comp.component.transform().scale).toBe(3);

		comp.component.api.reset();
		await waitForEffects();
		expect(comp.component.transform()).toEqual({ x: 0, y: 0, scale: 1 });
	});

	test('scale clamps to the configured bounds', async () => {
		const comp = render(PanZoomHarness);
		await waitForEffects();
		comp.component.api.zoomTo(999);
		await waitForEffects();
		expect(comp.component.transform().scale).toBe(5); // maxScale
		comp.component.api.zoomTo(0.001);
		await waitForEffects();
		expect(comp.component.transform().scale).toBe(0.2); // minScale
	});
});
