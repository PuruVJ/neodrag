import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { dispatchPointer, pointerDrag, startCursorTracking, stopCursorTracking } from '../../core/tests/mouse.ts';
import { waitForEffects } from '../../core/tests/utils.ts';
import { usePanZoom } from '../src/panzoom.ts';
import { useSplitPane } from '../src/splitpane.ts';
import { useSwipe } from '../src/swipe.ts';
import { useSelect } from '../src/select.ts';

// End-to-end through the React adapters: real pointer gestures drive the engine, which drives the
// core binder, whose onChange re-renders React. Verifies the adapter glue AND the behaviour wiring.
async function mount(el: React.ReactElement) {
	const host = document.createElement('div');
	document.body.appendChild(host);
	const root = createRoot(host);
	root.render(el);
	await waitForEffects();
	return { host, cleanup: () => { root.unmount(); host.remove(); } };
}

function Canvas() {
	const { viewport, world, scale, x, y, zoomTo } = usePanZoom({ minScale: 0.5, maxScale: 4 });
	return (
		<div>
			<div ref={viewport} data-testid="vp" style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 200 }}>
				<div ref={world} data-testid="world"><div style={{ width: 50, height: 50 }} /></div>
			</div>
			<span data-testid="xy">{x},{y}</span>
			<span data-testid="scale">{scale}</span>
			<button data-testid="zoom" onClick={() => zoomTo(2)} />
		</div>
	);
}

function Split() {
	const { container, pane, gutter, sizes } = useSplitPane({ sizes: [1, 1] });
	return (
		<div>
			<div ref={container} data-testid="c" style={{ position: 'absolute', top: 0, left: 0, width: 300, height: 100 }}>
				<div ref={pane(0)}>A</div>
				<div ref={gutter(0)} data-testid="g" style={{ width: 10, background: '#000', cursor: 'col-resize' }} />
				<div ref={pane(1)}>B</div>
			</div>
			<span data-testid="sizes">{sizes.join(',')}</span>
		</div>
	);
}

function Card() {
	const { ref, isDismissed } = useSwipe({ threshold: 0.4 });
	return <div ref={ref} data-testid="card" data-dismissed={isDismissed ? '1' : '0'} style={{ position: 'absolute', top: 0, left: 0, width: 100, height: 100 }} />;
}

function Grid() {
	const { container, item, selected } = useSelect();
	return (
		<div>
			<div ref={container} data-testid="grid" style={{ position: 'absolute', top: 0, left: 0, width: 220, height: 220 }}>
				<div ref={item('a')} style={{ position: 'absolute', left: 110, top: 110, width: 40, height: 40 }} />
				<div ref={item('b')} style={{ position: 'absolute', left: 150, top: 150, width: 40, height: 40 }} />
			</div>
			<span data-testid="count">{selected.slice().sort().join('')}</span>
		</div>
	);
}

describe('@neodrag/react new capability wrappers (pointer-driven)', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => stopCursorTracking());

	test('usePanZoom: drag pans the world, and zoomTo mirrors scale', async () => {
		const { host, cleanup } = await mount(<Canvas />);
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
		const { host, cleanup } = await mount(<Split />);
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
		const { host, cleanup } = await mount(<Card />);
		const card = host.querySelector('[data-testid="card"]') as HTMLElement;
		expect(card.dataset.dismissed).toBe('0');
		await pointerDrag(card, { deltaX: 70, deltaY: 0 }); // > 40px threshold (0.4 * 100)
		await waitForEffects();
		expect(card.dataset.dismissed).toBe('1');
		cleanup();
	});

	test('useSelect: a marquee selects the items it sweeps', async () => {
		const { host, cleanup } = await mount(<Grid />);
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
