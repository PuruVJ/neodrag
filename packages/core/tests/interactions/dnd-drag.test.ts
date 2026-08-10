/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	return el;
}

function input(node: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target: node });
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Drag capability (DOM)', () => {
	it('translates by the pointer delta and fires the lifecycle callbacks', () => {
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
		dnd.host.onInteractionMove(input(node, 'move', 150, 140));
		dnd.host.onInteractionEnd(input(node, 'end', 150, 140));

		expect(events).toEqual(['start', 'drag', 'drag', 'end']);
		expect(translate(node)).toEqual({ x: 50, y: 40 });
		expect(node.hasAttribute('data-neodrag-dragging')).toBe(false);
	});

	it('axis:x ignores vertical movement', () => {
		const node = makeNode();
		const drag = new Drag();
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(drag);
		drag.bind(node, { axis: 'x' });
		dnd.host.onInteractionStart(input(node, 'start', 0, 0));
		dnd.host.onInteractionMove(input(node, 'move', 20, 99));
		dnd.host.onInteractionEnd(input(node, 'end', 20, 99));
		expect(translate(node)).toEqual({ x: 20, y: 0 });
	});

	it('respects disabled (never starts)', () => {
		const node = makeNode();
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		dnd.use(drag);
		drag.bind(node, { disabled: true });
		dnd.host.onInteractionStart(input(node, 'start', 0, 0));
		dnd.host.onInteractionMove(input(node, 'move', 30, 30));
		dnd.host.onInteractionEnd(input(node, 'end', 30, 30));
		expect(node.style.translate).toBe('');
		expect(dnd.session).toBeNull();
	});

	it('runs a use:[] plugin that adjusts the offset (the @neodrag/extend seam)', () => {
		const node = makeNode();
		const snap10 = {
			name: 'snap',
			onMove: ({ offset }: { offset: { x: number; y: number } }) => ({
				x: Math.round(offset.x / 10) * 10,
				y: Math.round(offset.y / 10) * 10,
			}),
		};
		const drag = new Drag();
		const dnd = new Interactions({ defaultSensors: false });
		dnd.use(drag);
		drag.bind(node, { use: [snap10] });
		dnd.host.onInteractionStart(input(node, 'start', 0, 0));
		dnd.host.onInteractionMove(input(node, 'move', 23, 47));
		dnd.host.onInteractionEnd(input(node, 'end', 23, 47));
		expect(translate(node)).toEqual({ x: 20, y: 50 });
	});

	it('threshold delays start until the pointer moves far enough', () => {
		const node = makeNode();
		const events: string[] = [];
		const dnd = new Interactions({ defaultSensors: false });
		const drag = new Drag();
		dnd.use(drag);
		drag.bind(node, { threshold: 10, onDragStart: () => events.push('start') });
		dnd.host.onInteractionStart(input(node, 'start', 0, 0));
		dnd.host.onInteractionMove(input(node, 'move', 3, 3)); // under threshold
		expect(events).toEqual([]);
		dnd.host.onInteractionMove(input(node, 'move', 12, 0)); // over threshold
		expect(events).toEqual(['start']);
	});
});
