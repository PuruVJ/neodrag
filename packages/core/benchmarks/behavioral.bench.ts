/**
 * @vitest-environment jsdom
 */
import { bench, describe } from 'vitest';
import { Neodrag, position, threshold, transform } from '../src/index.ts';
import { assertTranslate } from './helpers/behavioral.ts';
import { createDraggableNode, flushEffects, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

const MINIMAL = [transform, position({ current: { x: 0, y: 0 } })];
const DRAG = {
	fromX: 120,
	fromY: 120,
	toX: 220,
	toY: 220,
	steps: 16,
	expected: { x: 100, y: 100 },
};

describe('behavioral — transform after drag', () => {
	bench(
		'default stack reaches (100, 100) translate',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const engine = new Neodrag();
			const handle = engine.draggable(node, []);
			simulateDragSteps(node, DRAG);
			await flushEffects();
			assertTranslate(node, DRAG.expected);
			handle.destroy();
			engine.dispose();
		},
		{ iterations: 25, warmupIterations: 3 },
	);

	bench(
		'minimal plugins reach (100, 100) translate',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const engine = new Neodrag({ plugins: MINIMAL });
			const handle = engine.draggable(node, [threshold(null)]);
			simulateDragSteps(node, DRAG);
			await flushEffects();
			assertTranslate(node, DRAG.expected);
			handle.destroy();
			engine.dispose();
		},
		{ iterations: 25, warmupIterations: 3 },
	);
});

describe('behavioral — repeated drag stability', () => {
	bench(
		'five consecutive identical drags',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const engine = new Neodrag({ plugins: MINIMAL });
			const handle = engine.draggable(node, [threshold(null)]);

			for (let i = 0; i < 5; i++) {
				simulateDragSteps(node, DRAG);
				await flushEffects();
				assertTranslate(node, DRAG.expected);
			}

			handle.destroy();
			engine.dispose();
		},
		{ iterations: 10, warmupIterations: 1 },
	);

	bench(
		'engine.update does not re-init same plugin keys',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const engine = new Neodrag({ plugins: MINIMAL });
			let inits = 0;
			const pos = position({ current: { x: 0, y: 0 } });
			const origInit = pos.init!;
			pos.init = (ctx) => {
				inits++;
				return origInit(ctx);
			};

			engine.draggable(node, [transform, pos]);
			inits = 0;
			engine.update(node, [transform, position({ current: { x: 0, y: 0 } })]);
			if (inits !== 0) {
				throw new Error(`expected 0 init calls after options-only update, got ${inits}`);
			}

			simulateDragSteps(node, DRAG);
			await flushEffects();
			assertTranslate(node, DRAG.expected);
			engine.dispose();
		},
		{ iterations: 20, warmupIterations: 2 },
	);
});
