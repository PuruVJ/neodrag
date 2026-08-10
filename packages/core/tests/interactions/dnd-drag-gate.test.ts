/**
 * @vitest-environment jsdom
 *
 * Drag start-gate via `registerHandle` / `registerCancel`: a drag may start only from inside a
 * handle (once any exist), never from inside a cancel, and the innermost registered marker on the
 * pointer's composedPath wins (priority overrides the nesting). No selectors, no reflow.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import { Interactions } from '../../src/engine.ts';
import { pointerToInput, type InteractionPhase } from '../../src/interaction-input.ts';
import { mockRect, translate } from './_browser.ts';

/** A pointer input whose `composedPath()` is the supplied chain — the real ancestor path a browser
 * hands the gate (the programmatic helper only carries `[target]`, which can't climb to the root). */
function pointer(path: EventTarget[], phase: InteractionPhase, x: number, y: number) {
	const native = {
		clientX: x,
		clientY: y,
		target: path[0] ?? null,
		shiftKey: false,
		ctrlKey: false,
		altKey: false,
		metaKey: false,
		timeStamp: 0,
		pointerId: 1,
		pointerType: 'mouse',
		button: 0,
		buttons: 1,
		pressure: 0.5,
		composedPath: () => path,
	} as unknown as PointerEvent;
	return pointerToInput(native, phase);
}

/** Drive a full press-drag-release from `down` (the chain under the pointer) and report the box's
 * resulting translate — `{30,20}` if the drag was allowed, `{0,0}` if the gate blocked it. */
function dragFrom(dnd: Interactions, box: HTMLElement, down: HTMLElement[]) {
	const path = [...down, box, document];
	dnd.host.onInteractionStart(pointer(path, 'start', 100, 100));
	dnd.host.onInteractionMove(pointer(path, 'move', 130, 120));
	dnd.host.onInteractionEnd(pointer(path, 'end', 130, 120));
	const t = translate(box);
	// Reset so the next gesture in a test starts from zero.
	(box as HTMLElement).style.translate = '';
	return t;
}

function setup() {
	const box = document.createElement('div');
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 200, bottom: 200 });
	const dnd = new Interactions({ defaultSensors: false });
	const drag = new Drag();
	dnd.use(drag);
	const handle = drag.bind(box, {});
	return { box, dnd, handle };
}

const el = () => document.createElement('div');
const allowed = { x: 30, y: 20 };
const blocked = { x: 0, y: 0 };

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Drag start-gate (register handle/cancel)', () => {
	it('with no markers, the whole node drags', () => {
		const { box, dnd } = setup();
		expect(dragFrom(dnd, box, [])).toEqual(allowed);
	});

	it('a registered handle is an allow-list — drag starts only from inside it', () => {
		const { box, dnd, handle } = setup();
		const bar = el();
		box.appendChild(bar);
		handle.registerHandle(bar);
		expect(dragFrom(dnd, box, [bar])).toEqual(allowed); // on the handle
		expect(dragFrom(dnd, box, [])).toEqual(blocked); // body, off the handle → blocked
	});

	it('a registered cancel blocks; elsewhere stays free', () => {
		const { box, dnd, handle } = setup();
		const no = el();
		box.appendChild(no);
		handle.registerCancel(no);
		expect(dragFrom(dnd, box, [no])).toEqual(blocked); // on the cancel
		expect(dragFrom(dnd, box, [])).toEqual(allowed); // body → free (no handles defined)
	});

	it('innermost wins — a cancel nested in a handle blocks, the handle around it allows', () => {
		const { box, dnd, handle } = setup();
		const bar = el();
		const btn = el();
		bar.appendChild(btn);
		box.appendChild(bar);
		handle.registerHandle(bar);
		handle.registerCancel(btn);
		expect(dragFrom(dnd, box, [btn, bar])).toEqual(blocked); // on the button → cancel wins
		expect(dragFrom(dnd, box, [bar])).toEqual(allowed); // on the bar → handle
	});

	it('a handle nested in a cancel allows', () => {
		const { box, dnd, handle } = setup();
		const cancel = el();
		const grip = el();
		cancel.appendChild(grip);
		box.appendChild(cancel);
		handle.registerCancel(cancel);
		handle.registerHandle(grip);
		expect(dragFrom(dnd, box, [grip, cancel])).toEqual(allowed); // innermost grip → handle
		expect(dragFrom(dnd, box, [cancel])).toEqual(blocked); // on the cancel
	});

	it('priority overrides the nesting cascade', () => {
		const { box, dnd, handle } = setup();
		const outer = el();
		const inner = el();
		outer.appendChild(inner);
		box.appendChild(outer);
		handle.registerHandle(outer, { priority: 5 });
		handle.registerCancel(inner, { priority: 0 });
		// Pointer on the inner cancel, but the outer handle's higher priority wins → allowed.
		expect(dragFrom(dnd, box, [inner, outer])).toEqual(allowed);
	});

	it('the disposer unregisters (idempotent) — removing the only handle restores free drag', () => {
		const { box, dnd, handle } = setup();
		const bar = el();
		box.appendChild(bar);
		const off = handle.registerHandle(bar);
		expect(dragFrom(dnd, box, [])).toEqual(blocked); // gated while the handle exists
		off();
		off(); // idempotent
		expect(dragFrom(dnd, box, [])).toEqual(allowed); // handle gone → whole node drags again
	});
});
