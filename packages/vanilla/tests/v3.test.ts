/**
 * @vitest-environment jsdom
 *
 * Smoke test for the v3 vanilla surface: the package main re-exports the core v3
 * class API verbatim. We import from the package entry (`../src/index.ts`) and drive a
 * real `Draggable` through a pointer interaction in jsdom.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Draggable, Droppable, Resizable, Sortable, Interactions, Drag } from '../src/index.ts';

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	return el;
}

// A minimal programmatic interaction input — the same shape the engine's sensors hand to
// `dnd.host`. Driving the engine directly keeps the test deterministic (no reliance on
// jsdom pointer-event fidelity).
function input(target: EventTarget, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return {
		kind: 'programmatic' as const,
		phase,
		clientX: x,
		clientY: y,
		target,
		modifiers: { shift: false, ctrl: false, alt: false, meta: false },
		timestamp: 0,
		pointerId: 1,
	};
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('@neodrag/vanilla v3 entry', () => {
	it('re-exports the v3 class API', () => {
		expect(typeof Draggable).toBe('function');
		expect(typeof Droppable).toBe('function');
		expect(typeof Resizable).toBe('function');
		expect(typeof Sortable).toBe('function');
		expect(typeof Interactions).toBe('function');
		expect(typeof Drag).toBe('function');
	});

	it('constructs a Draggable and exposes lifecycle state', () => {
		const node = makeNode();
		const draggable = new Draggable(node, { axis: 'both' });

		expect(draggable.isDragging).toBe(false);
		expect(draggable.offset).toEqual({ x: 0, y: 0 });

		draggable.destroy();
	});

	it('drives a drag through the engine and translates by the pointer delta', () => {
		const node = makeNode();
		const events: string[] = [];

		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		dnd.use(drag);
		drag.bind(node, {
			onDragStart: () => events.push('start'),
			onDrag: () => events.push('drag'),
			onDragEnd: () => events.push('end'),
		});

		dnd.host.onInteractionStart(input(node, 'start', 100, 100));
		dnd.host.onInteractionMove(input(node, 'move', 130, 120));
		expect(node.hasAttribute('data-neodrag-dragging')).toBe(true);
		expect(node.style.translate).toBe('30px 20px');

		dnd.host.onInteractionEnd(input(node, 'end', 130, 120));
		expect(node.hasAttribute('data-neodrag-dragging')).toBe(false);
		expect(events).toEqual(['start', 'drag', 'end']);
	});

	it('supports fine-grained update() and clean destroy()', () => {
		const node = makeNode();
		const draggable = new Draggable(node, { axis: 'both' });

		expect(() => draggable.update({ axis: 'x' })).not.toThrow();
		expect(() => draggable.destroy()).not.toThrow();
	});
});
