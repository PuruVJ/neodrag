import { describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import type { Capability, InteractionSession, ResolvedTarget } from '../../src/types.ts';
import type { InteractionInput } from '../../src/interaction-input.ts';

/** A node that records its pointer-capture calls and tracks who holds the capture. */
function captureNode() {
	let held = -1;
	const calls = { set: [] as number[], release: [] as number[] };
	const node = {
		setPointerCapture(id: number) {
			held = id;
			calls.set.push(id);
		},
		hasPointerCapture(id: number) {
			return held === id;
		},
		releasePointerCapture(id: number) {
			if (held === id) held = -1;
			calls.release.push(id);
		},
	} as unknown as HTMLElement;
	return { node, calls };
}

function pointer(x: number, y: number, phase: 'start' | 'move' | 'end'): InteractionInput {
	return {
		kind: 'pointer',
		phase,
		clientX: x,
		clientY: y,
		target: null,
		modifiers: { shift: false, ctrl: false, alt: false, meta: false },
		timestamp: 0,
		native: { composedPath: () => [] } as unknown as PointerEvent,
		pointer: { pointerId: 1, pointerType: 'mouse', button: 0, buttons: 1, pressure: 0.5 },
	} as InteractionInput;
}

function drive(dnd: Interactions, x: number, y: number, phase: 'start' | 'move' | 'end') {
	const input = pointer(x, y, phase);
	if (phase === 'start') dnd.host.onInteractionStart(input);
	else if (phase === 'move') dnd.host.onInteractionMove(input);
	else dnd.host.onInteractionEnd(input);
}

function cap(node: HTMLElement, opts: Partial<Capability> = {}): Capability {
	return {
		key: Symbol('cap'),
		name: 'cap',
		resolve: () => ({ node }) as ResolvedTarget,
		start: () => {},
		move: () => {},
		end: () => {},
		...opts,
	};
}

describe('engine — pointer capture lifecycle', () => {
	it('captures on start and releases on normal end', () => {
		const { node, calls } = captureNode();
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(cap(node));

		drive(dnd, 0, 0, 'start');
		drive(dnd, 5, 5, 'move'); // first move crosses threshold → start() → setPointerCapture
		expect(calls.set).toEqual([1]);
		expect(calls.release).toEqual([]);

		drive(dnd, 9, 9, 'end');
		expect(calls.release).toEqual([1]); // explicit release on end
	});

	it('releases capture on cancel (where the browser would not auto-release)', () => {
		const { node, calls } = captureNode();
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(cap(node, { move: (s: InteractionSession) => s.end('cancel') }));

		drive(dnd, 0, 0, 'start');
		drive(dnd, 5, 5, 'move'); // start → capture, then move → s.end('cancel') → release

		expect(calls.set).toEqual([1]);
		expect(calls.release).toEqual([1]);
		expect(dnd.session).toBeNull();
	});

	it('does not release when no capture was taken (sub-threshold tap)', () => {
		const { node, calls } = captureNode();
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(cap(node, { shouldStart: () => false }));

		drive(dnd, 0, 0, 'start');
		drive(dnd, 1, 1, 'move'); // gate closed → never started → never captured
		drive(dnd, 1, 1, 'end');

		expect(calls.set).toEqual([]);
		expect(calls.release).toEqual([]);
	});
});
