import { createApp, h } from 'vue';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { dispatchPointer, pointerDrag, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import { usePanZoom } from '@neodrag/vue/panzoom';
import { useSplitPane } from '@neodrag/vue/splitpane';
import { useSwipe } from '@neodrag/vue/swipe';
import { useSelect } from '@neodrag/vue/select';

// End-to-end through the Vue adapters: real pointer gestures drive the engine, which drives the
// core binder, whose onChange updates the reactive refs and re-renders Vue. Verifies the adapter
// glue (fn-ref lifecycle, reactive-ref mirroring) AND the behaviour wiring.
async function mount(component: Parameters<typeof createApp>[0]) {
	const host = document.createElement('div');
	document.body.appendChild(host);
	const app = createApp(component);
	app.mount(host);
	await waitForEffects();
	return { host, cleanup: () => { app.unmount(); host.remove(); } };
}

describe('@neodrag/vue new capability wrappers (pointer-driven)', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('usePanZoom: drag pans the world, and zoomTo mirrors scale', async () => {
		const { host, cleanup } = await mount({
			setup() {
				const { viewport, world, scale, x, y, zoomTo } = usePanZoom({ minScale: 0.5, maxScale: 4 });
				return () =>
					h('div', [
						h('div', { ref: viewport, 'data-testid': 'vp', style: 'position:absolute;top:0;left:0;width:300px;height:200px' }, [
							h('div', { ref: world, 'data-testid': 'world' }, [h('div', { style: 'width:50px;height:50px' })]),
						]),
						h('span', { 'data-testid': 'xy' }, `${x.value},${y.value}`),
						h('span', { 'data-testid': 'scale' }, String(scale.value)),
						h('button', { 'data-testid': 'zoom', onClick: () => zoomTo(2) }),
					]);
			},
		});
		const vp = host.querySelector('[data-testid="vp"]') as HTMLElement;
		const world = host.querySelector('[data-testid="world"]') as HTMLElement;
		expect(vp.style.overflow).toBe('hidden');

		await pointerDrag(vp, { deltaX: 60, deltaY: 30 });
		await waitForEffects();
		expect(world.style.transform).toContain('translate(60px, 30px)');
		expect(host.querySelector('[data-testid="xy"]')!.textContent).toBe('60,30');

		(host.querySelector('[data-testid="zoom"]') as HTMLElement).click();
		await waitForEffects();
		expect(host.querySelector('[data-testid="scale"]')!.textContent).toBe('2');
		cleanup();
	});

	test('useSplitPane: dragging the gutter redistributes the weights', async () => {
		const { host, cleanup } = await mount({
			setup() {
				const { container, pane, gutter, sizes } = useSplitPane({ sizes: [1, 1] });
				return () =>
					h('div', [
						h('div', { ref: container, 'data-testid': 'c', style: 'position:absolute;top:0;left:0;width:300px;height:100px' }, [
							h('div', { ref: pane(0) }, 'A'),
							h('div', { ref: gutter(0), 'data-testid': 'g', style: 'width:10px;background:#000;cursor:col-resize' }),
							h('div', { ref: pane(1) }, 'B'),
						]),
						h('span', { 'data-testid': 'sizes' }, sizes.value.join(',')),
					]);
			},
		});
		expect((host.querySelector('[data-testid="c"]') as HTMLElement).style.display).toBe('flex');
		expect(host.querySelector('[data-testid="sizes"]')!.textContent).toBe('1,1');

		await pointerDrag(host.querySelector('[data-testid="g"]') as HTMLElement, { deltaX: 60, deltaY: 0 });
		await waitForEffects();
		const [a, b] = host.querySelector('[data-testid="sizes"]')!.textContent!.split(',').map(Number);
		expect(a).toBeGreaterThan(1.2); // pane 0 grew
		expect(b).toBeLessThan(0.8); // pane 1 shrank by exactly as much
		expect(a + b).toBeCloseTo(2, 5); // budget conserved
		cleanup();
	});

	test('useSwipe: a drag past the threshold dismisses', async () => {
		const { host, cleanup } = await mount({
			setup() {
				const { ref: r, isDismissed } = useSwipe({ threshold: 0.4 });
				return () =>
					h('div', {
						ref: r,
						'data-testid': 'card',
						'data-dismissed': isDismissed.value ? '1' : '0',
						style: 'position:absolute;top:0;left:0;width:100px;height:100px',
					});
			},
		});
		const card = host.querySelector('[data-testid="card"]') as HTMLElement;
		expect(card.dataset.dismissed).toBe('0');
		await pointerDrag(card, { deltaX: 70, deltaY: 0 }); // > 40px threshold (0.4 * 100)
		await waitForEffects();
		expect(card.dataset.dismissed).toBe('1');
		cleanup();
	});

	test('useSelect: a marquee selects the items it sweeps', async () => {
		const { host, cleanup } = await mount({
			setup() {
				const { container, item, selected } = useSelect();
				return () =>
					h('div', [
						h('div', { ref: container, 'data-testid': 'grid', style: 'position:absolute;top:0;left:0;width:220px;height:220px' }, [
							h('div', { ref: item('a'), style: 'position:absolute;left:110px;top:110px;width:40px;height:40px' }),
							h('div', { ref: item('b'), style: 'position:absolute;left:150px;top:150px;width:40px;height:40px' }),
						]),
						h('span', { 'data-testid': 'count' }, selected.value.slice().sort().join('')),
					]);
			},
		});
		const grid = host.querySelector('[data-testid="grid"]') as HTMLElement;
		const b = grid.getBoundingClientRect();
		// Box from (95,95) out to (200,200) covers both items at 110/150.
		dispatchPointer(grid, 'pointerdown', b.left + 95, b.top + 95, 1);
		dispatchPointer(grid, 'pointermove', b.left + 200, b.top + 200, 1);
		await waitForEffects();
		expect(host.querySelector('[data-testid="count"]')!.textContent).toBe('ab');
		dispatchPointer(grid, 'pointerup', b.left + 200, b.top + 200, 0);
		cleanup();
	});
});
