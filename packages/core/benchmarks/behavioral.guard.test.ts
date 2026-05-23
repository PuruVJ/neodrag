/**
 * @vitest-environment jsdom
 *
 * Fast CI guard for behavioral scenarios (same invariants as behavioral.bench.ts).
 */
import { afterEach, describe, expect, it } from 'vitest';
import { DraggableFactory, DEFAULTS } from '../src/index.ts';
import { threshold, transform } from '../src/plugins.ts';
import { createEngine, position, transform as iTransform } from '../src/interactions/index.ts';
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
	it('v3 default drag reaches expected translate', async () => {
		const node = createDraggableNode();
		const factory = new DraggableFactory(DEFAULTS);
		const dispose = factory.draggable(node, []);
		simulateDragSteps(node, DRAG);
		await flushEffects();
		assertTranslate(node, DRAG.expected);
		dispose();
		factory.dispose();
	});

	it('v4 default drag reaches expected translate', async () => {
		const node = createDraggableNode();
		const engine = createEngine();
		const handle = engine.draggable(node, []);
		simulateDragSteps(node, DRAG);
		await flushEffects();
		assertTranslate(node, DRAG.expected);
		handle.destroy();
		engine.dispose();
	});

	it('v3 and v4 minimal stacks agree on translate', async () => {
		const v3Node = createDraggableNode();
		const v4Node = createDraggableNode();

		const v3Factory = new DraggableFactory({
			...DEFAULTS,
			plugins: [transform(), threshold(null)],
		});
		const v4Engine = createEngine({
			plugins: [iTransform, position({ current: { x: 0, y: 0 } })],
		});

		const d1 = v3Factory.draggable(v3Node, []);
		const d2 = v4Engine.draggable(v4Node, []);

		simulateDragSteps(v3Node, DRAG);
		simulateDragSteps(v4Node, DRAG);
		await flushEffects();

		const a = parseTranslate(v3Node);
		const b = parseTranslate(v4Node);
		expect(a.x).toBeCloseTo(b.x, 0);
		expect(a.y).toBeCloseTo(b.y, 0);
		assertTranslate(v3Node, DRAG.expected);

		d1();
		d2.destroy();
		v3Factory.dispose();
		v4Engine.dispose();
	});
});
