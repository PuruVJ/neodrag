/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULTS, Neodrag, position, threshold, transform } from '../src/index.ts';
import { assertTranslate } from './helpers/behavioral.ts';
import { createDraggableNode, flushEffects, parseTranslate, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

const DRAG = {
	fromX: 120,
	fromY: 120,
	toX: 220,
	toY: 220,
	steps: 16,
	expected: { x: 100, y: 100 },
};

afterEach(() => {
	resetBody();
});

describe('benchmark behavioral guards', () => {
	it('default drag reaches expected translate', async () => {
		const node = createDraggableNode();
		const engine = new Neodrag();
		const handle = engine.draggable(node, []);
		simulateDragSteps(node, DRAG);
		await flushEffects();
		assertTranslate(node, DRAG.expected);
		handle.destroy();
		engine.dispose();
	});

	it('minimal stack reaches expected translate', async () => {
		const node = createDraggableNode();
		const engine = new Neodrag({
			plugins: [transform, position({ current: { x: 0, y: 0 } })],
		});
		const handle = engine.draggable(node, [threshold(null)]);
		simulateDragSteps(node, DRAG);
		await flushEffects();
		assertTranslate(node, DRAG.expected);
		handle.destroy();
		engine.dispose();
	});

	it('two engines agree on translate', async () => {
		const a = createDraggableNode();
		const b = createDraggableNode();
		const engine = new Neodrag({ plugins: DEFAULTS.plugins });

		const h1 = engine.draggable(a, []);
		const h2 = engine.draggable(b, []);

		simulateDragSteps(a, DRAG);
		simulateDragSteps(b, DRAG);
		await flushEffects();

		const ta = parseTranslate(a);
		const tb = parseTranslate(b);
		expect(ta.x).toBeCloseTo(tb.x, 0);
		expect(ta.y).toBeCloseTo(tb.y, 0);

		h1.destroy();
		h2.destroy();
		engine.dispose();
	});
});
