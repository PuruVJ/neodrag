import { createApp, h, nextTick, ref, type Ref } from 'vue';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { useDraggable, type DragEventData } from '@neodrag/vue';
import {
	dragAndDrop,
	pointerDrag,
	pointerMoveTo,
	pointerRelease,
	startCursorTracking,
	stopCursorTracking,
} from '../../core/tests/mouse.ts';
import { sleepAndWaitForEffects } from '../../core/tests/utils.ts';

// Read the inline `translate` the engine writes (`<x>px <y>px`) back as numbers. We assert on the
// raw inline style the engine sets (see core/src/transform.ts) rather than computed style, which
// browsers normalize differently across engines.
function readTranslate(el: HTMLElement): { x: number; y: number } {
	const value = el.style.translate.trim();
	if (!value) return { x: 0, y: 0 };
	const [x, y = '0'] = value.split(/\s+/);
	return { x: parseFloat(x), y: parseFloat(y) };
}

type Mount<T> = {
	host: HTMLDivElement;
	el: HTMLElement;
	state: T;
	unmount: () => void;
};

// Mount a single draggable <div> driven by `setup`, returning the live DOM node plus whatever
// reactive handles `setup` exposes so each test can poke state and re-render.
async function mountDraggable<T extends Record<string, unknown>>(
	setup: () => { options: Parameters<typeof useDraggable>[0]; state: T },
): Promise<Mount<T>> {
	const host = document.createElement('div');
	document.body.appendChild(host);

	let state!: T;
	const app = createApp({
		setup() {
			const { options, state: s } = setup();
			state = s;
			const { ref: target } = useDraggable(options);
			return () =>
				h('div', {
					ref: target,
					'data-testid': 'draggable',
					style: 'width:100px;height:100px;background:cyan;',
				});
		},
	});
	app.mount(host);
	await nextTick();
	await sleepAndWaitForEffects();

	const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
	return { host, el, state, unmount: () => app.unmount() };
}

describe('@neodrag/vue v3 wrapper invariants', () => {
	beforeEach(() => startCursorTracking());
	afterEach(() => {
		stopCursorTracking();
		document.body.innerHTML = '';
	});

	// INVARIANT 1: a reactive option (passed as a getter over a ref) takes effect live, without the
	// node being re-bound. Start axis='x' -> diagonal drag only moves x; flip to 'y' -> only y.
	test('reactive axis option updates live without re-binding', async () => {
		const { el, state, unmount } = await mountDraggable(() => {
			const axis = ref<'x' | 'y' | 'both'>('x');
			return {
				options: {
					get axis() {
						return axis.value;
					},
				},
				state: { axis },
			};
		});

		await dragAndDrop(el, { deltaX: 40, deltaY: 30 }, { steps: 4 });
		await sleepAndWaitForEffects();
		// axis='x': vertical movement ignored.
		expect(readTranslate(el)).toEqual({ x: 40, y: 0 });

		// Flip the reactive axis. The wrapper's watchEffect must push this to the live instance.
		state.axis.value = 'y';
		await nextTick();
		await sleepAndWaitForEffects();

		await dragAndDrop(el, { deltaX: 25, deltaY: 35 }, { steps: 4 });
		await sleepAndWaitForEffects();
		// The live axis flip took effect: this drag moves only on y (the engine pins the inactive
		// axis to 0, so the prior x:40 is dropped). The proof is that x stayed at 0 through a 25px
		// horizontal push while y picked up the 35px — the new axis is the one being honored.
		expect(readTranslate(el)).toEqual({ x: 0, y: 35 });

		unmount();
	});

	// INVARIANT 2: changing a reactive option mid-drag must `update()` in place, not tear down and
	// rebuild the underlying core instance. We prove the binding survives by holding the pointer
	// down, flipping an unrelated reactive option, and checking the drag is still live (isDragging
	// stays true, accumulated offset preserved) and continues to track the pointer afterwards.
	test('reactive option change mid-drag does not recreate/tear down the instance', async () => {
		const isDragging = ref(false);
		const { el, state, unmount } = await mountDraggable(() => {
			const disabled = ref(false);
			return {
				options: {
					get disabled() {
						return disabled.value;
					},
					onDragStart: () => (isDragging.value = true),
					onDragEnd: () => (isDragging.value = false),
				},
				state: { disabled },
			};
		});

		// Start a drag and hold the pointer down (release: false) so the session stays open.
		await pointerDrag(el, { deltaX: 30, deltaY: 20 }, { steps: 3, release: false });
		await sleepAndWaitForEffects();
		expect(isDragging.value).toBe(true);
		expect(readTranslate(el)).toEqual({ x: 30, y: 20 });

		// Flip an unrelated reactive option WHILE the drag is in flight. If the wrapper recreated the
		// core instance (destroy + new Draggable), the open session would be lost: isDragging would
		// reset and the held pointer would no longer drive this node.
		state.disabled.value = true;
		await nextTick();
		await sleepAndWaitForEffects();
		// `disabled` only gates new starts; the in-flight session is untouched -> still dragging.
		expect(isDragging.value).toBe(true);

		// Reset disabled so the session can keep moving, then continue dragging the held pointer.
		state.disabled.value = false;
		await nextTick();
		await sleepAndWaitForEffects();

		const rect = el.getBoundingClientRect();
		await pointerMoveTo(rect.left + rect.width / 2 + 15, rect.top + rect.height / 2 + 10, 2);
		await sleepAndWaitForEffects();
		expect(isDragging.value).toBe(true);
		// Offset accumulated on the SAME session: 30+15, 20+10.
		expect(readTranslate(el)).toEqual({ x: 45, y: 30 });

		await pointerRelease();
		await sleepAndWaitForEffects();
		expect(isDragging.value).toBe(false);

		unmount();
	});

	// INVARIANT 3: a two-way `position` (get/set over a ref) must not loop. The setter writes the
	// new offset back into the same ref the getter reads, which re-runs the wrapper's watchEffect;
	// the engine must treat the echoed value as a no-op. We assert: the test finishes (no timeout),
	// the bound ref equals the final offset, the node's translate matches, and onDrag is bounded.
	test('two-way position does not infinite-loop and stays in sync', async () => {
		let dragCount = 0;
		const pos: Ref<{ x: number; y: number }> = ref({ x: 0, y: 0 });
		const { el, state, unmount } = await mountDraggable(() => {
			return {
				options: {
					get position() {
						return pos.value;
					},
					set position(v: { x: number; y: number }) {
						pos.value = v;
					},
					onDrag: (_e: DragEventData) => {
						dragCount++;
					},
				},
				state: { pos },
			};
		});

		const steps = 5;
		await dragAndDrop(el, { deltaX: 50, deltaY: 35 }, { steps });
		await sleepAndWaitForEffects();

		// (a) Reaching here at all proves there was no runaway loop (it would have timed out).
		// (b) The setter synced the bound ref to the final offset.
		expect(state.pos.value).toEqual({ x: 50, y: 35 });
		// (c) The element's translate matches the bound position.
		expect(readTranslate(el)).toEqual({ x: 50, y: 35 });
		// (optional) onDrag is bounded by the pointer moves (each write-back re-runs the wrapper's
		// watchEffect, so it may fire a small constant factor more than `steps`) — NOT runaway. An
		// infinite position<->setter loop would push this into the hundreds/thousands.
		expect(dragCount).toBeGreaterThan(0);
		expect(dragCount).toBeLessThanOrEqual(steps * 3);

		unmount();
	});
});
