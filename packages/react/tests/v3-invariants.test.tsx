import { useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Draggable, useDraggable } from '../src/index.ts';
import {
	dragAndDrop,
	pointerDrag,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../../testing/src/mouse.ts';

// --- local helpers (the shared `translate`/`sleepAndWaitForEffects` utils are not yet
// extracted in this repo; keep them inline so the suite is self-contained) -------------

/**
 * HTML draggables are positioned via the CSS `translate` property (see core/transform.ts).
 * The browser normalizes the serialized value (`40px 0px` → `40px`), so parse the live
 * computed value and assert the numeric x/y pair instead of string-matching.
 */
function readTranslate(node: HTMLElement): { x: number; y: number } {
	const raw = getComputedStyle(node).translate; // e.g. "40px", "40px 25px", "none"
	if (!raw || raw === 'none') return { x: 0, y: 0 };
	const [x = '0', y = '0'] = raw.split(/\s+/);
	return { x: parseFloat(x), y: parseFloat(y) };
}

function expectTranslate(node: HTMLElement, x: number, y: number): void {
	expect(readTranslate(node)).toEqual({ x, y });
}

/** Flush React's commit + effects and let the engine's paint settle. */
async function flush(): Promise<void> {
	await new Promise((r) => requestAnimationFrame(() => r(undefined)));
	await new Promise((r) => setTimeout(r, 0));
	await new Promise((r) => requestAnimationFrame(() => r(undefined)));
}

function mount(): { host: HTMLElement; root: Root } {
	const host = document.createElement('div');
	document.body.appendChild(host);
	return { host, root: createRoot(host) };
}

describe('@neodrag/react v3 wrapper invariants', () => {
	let host: HTMLElement;
	let root: Root;

	beforeEach(() => {
		startCursorTracking();
		({ host, root } = mount());
	});

	afterEach(() => {
		root.unmount();
		host.remove();
		stopCursorTracking();
		vi.restoreAllMocks();
	});

	function el(): HTMLElement {
		return host.querySelector('[data-testid="draggable"]') as HTMLElement;
	}

	// -------------------------------------------------------------------------------------
	// 1. Reactivity: a reactive `axis` (plain value + re-render) takes effect live, in place.
	// -------------------------------------------------------------------------------------
	test('reactive axis takes effect live without recreating the element', async () => {
		function Box({ axis }: { axis: 'x' | 'y' }) {
			const { ref } = useDraggable({ axis });
			return (
				<div
					ref={ref}
					data-testid="draggable"
					style={{ width: 100, height: 100, background: 'cyan' }}
				/>
			);
		}

		root.render(<Box axis="x" />);
		await flush();

		const node = el();
		expect(node).toBeTruthy();

		// axis = 'x' → a diagonal drag only moves on x (y is pinned to 0).
		await dragAndDrop(node, { deltaX: 40, deltaY: 30 }, { steps: 5 });
		await flush();
		expectTranslate(node, 40, 0);

		// Flip the reactive option to 'y' (re-render, same node) and drag again.
		root.render(<Box axis="y" />);
		await flush();

		// Same DOM node — the binding updated in place, not recreated.
		expect(el()).toBe(node);

		// Now axis = 'y'. The constraint pins the OTHER axis (x) to 0 (see core constrainAxis:
		// `axis === 'y' → out.x = 0`), so a second diagonal drag collapses x and only y moves.
		// The flip is therefore proven live: pre-flip the element moved on x and not y; post-flip
		// it moves on y and not x — on the very same instance, no recreate.
		await dragAndDrop(node, { deltaX: 35, deltaY: 25 }, { steps: 5 });
		await flush();
		expectTranslate(node, 0, 25);
	});

	// -------------------------------------------------------------------------------------
	// 2. Instance stability: option changes `update()` in place — never re-construct/destroy.
	// -------------------------------------------------------------------------------------
	test('reactive option changes update() in place and never re-construct the core instance', async () => {
		// vi.spyOn cannot wrap a constructor directly, so we observe the lifecycle methods on
		// the prototype instead: `destroy` only runs on teardown / re-attach, `update` runs on
		// every render via useEffect. If an option change recreated the instance, the old one
		// would be destroyed — so "destroy never called during option churn" proves the core
		// instance was preserved and merely update()'d in place.
		const destroySpy = vi.spyOn(Draggable.prototype, 'destroy');
		const updateSpy = vi.spyOn(Draggable.prototype, 'update');

		function Box({ axis, disabled }: { axis: 'x' | 'y'; disabled: boolean }) {
			const { ref } = useDraggable({ axis, disabled });
			return (
				<div
					ref={ref}
					data-testid="draggable"
					style={{ width: 100, height: 100, background: 'cyan' }}
				/>
			);
		}

		root.render(<Box axis="x" disabled={false} />);
		await flush();
		const node = el();

		const destroysAfterMount = destroySpy.mock.calls.length;

		// Several reactive option changes — same node should be reused each time.
		root.render(<Box axis="y" disabled={false} />);
		await flush();
		root.render(<Box axis="y" disabled />);
		await flush();
		root.render(<Box axis="x" disabled={false} />);
		await flush();

		// The DOM node is stable across all those updates (ref callback never re-ran).
		expect(el()).toBe(node);

		// No teardown happened during option churn → the core instance was preserved.
		expect(destroySpy.mock.calls.length).toBe(destroysAfterMount);

		// And each render pushed a fine-grained update() into the live instance.
		expect(updateSpy.mock.calls.length).toBeGreaterThanOrEqual(3);

		// Strong complementary proof: an in-progress drag survives an unrelated option change.
		// Hold the pointer down (release: false), flip `axis` mid-drag, and confirm the drag
		// session is still alive (binding not torn down).
		await pointerDrag(node, { deltaX: 20, deltaY: 0 }, { steps: 3, release: false });
		await flush();

		root.render(<Box axis="x" disabled={false} />);
		await flush();

		// Still the same node, still no destroy → the live drag wasn't interrupted.
		expect(el()).toBe(node);
		expect(destroySpy.mock.calls.length).toBe(destroysAfterMount);

		// Cleanly end the held drag (explicit coords avoid a getMousePosition round-trip).
		const r = node.getBoundingClientRect();
		await pointerRelease(r.left + r.width / 2, r.top + r.height / 2);
		await flush();
	});

	// -------------------------------------------------------------------------------------
	// 3. Two-way `position` (get/set) does not infinite-loop and stays in sync.
	// -------------------------------------------------------------------------------------
	test('two-way position get/set syncs without an infinite loop', async () => {
		let dragCalls = 0;
		const final = { x: 0, y: 0 };

		function Box() {
			const [pos, setPos] = useState({ x: 0, y: 0 });
			const { ref } = useDraggable({
				get position() {
					return pos;
				},
				set position(v: { x: number; y: number }) {
					setPos(v);
					final.x = v.x;
					final.y = v.y;
				},
				onDrag() {
					dragCalls++;
				},
			});
			return (
				<div
					ref={ref}
					data-testid="draggable"
					data-pos={`${pos.x},${pos.y}`}
					style={{ width: 100, height: 100, background: 'magenta' }}
				/>
			);
		}

		root.render(<Box />);
		await flush();
		const node = el();

		const STEPS = 6;
		// If the get/set pair fed back into the engine, this would never settle (timeout).
		await dragAndDrop(node, { deltaX: 60, deltaY: 45 }, { steps: STEPS });
		await flush();

		// (a) We got here → no infinite loop (the test didn't time out).
		// (b) The bound state equals the final offset (setter synced).
		expect(final).toEqual({ x: 60, y: 45 });
		expect(node.dataset.pos).toBe('60,45');

		// (c) The element's translate matches the bound position.
		expectTranslate(node, 60, 45);

		// (d) onDrag fired a bounded number of times — proportional to pointer moves, NOT
		// runaway. A real feedback loop (setter → rerender → engine → onDrag → setter …) would
		// produce hundreds/thousands of calls; we assert a small multiple of the step count.
		expect(dragCalls).toBeGreaterThan(0);
		expect(dragCalls).toBeLessThanOrEqual(STEPS * 3);
	});
});
