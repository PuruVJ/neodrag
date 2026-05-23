/**
 * @vitest-environment jsdom
 *
 * Behavioral benchmarks: each iteration asserts invariants so regressions fail
 * the bench run (correctness under repeated execution, not just wall time).
 */
import { bench, describe } from 'vitest';
import { DraggableFactory, DEFAULTS } from '../src/index.ts';
import { threshold, transform } from '../src/plugins.ts';
import { createEngine, position, transform as iTransform } from '../src/interactions/index.ts';
import { assertOffset, assertTranslate } from './helpers/behavioral.ts';
import { createDraggableNode, flushEffects, parseTranslate, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

const MINIMAL_V3 = [transform(), threshold(null)];
const MINIMAL_V4 = [iTransform, position({ current: { x: 0, y: 0 } })];

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
		'v3 default stack reaches (100, 100) translate',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const factory = new DraggableFactory(DEFAULTS);
			const dispose = factory.draggable(node, []);
			simulateDragSteps(node, DRAG);
			await flushEffects();
			assertTranslate(node, DRAG.expected);
			const inst = factory.instances.get(node)!;
			assertOffset(inst, DRAG.expected);
			dispose();
			factory.dispose();
		},
		{ iterations: 25, warmupIterations: 3 },
	);

	bench(
		'v4 default stack reaches (100, 100) translate',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const engine = createEngine();
			const dispose = engine.draggable(node, []);
			simulateDragSteps(node, DRAG);
			await flushEffects();
			assertTranslate(node, DRAG.expected);
			dispose();
			engine.dispose();
		},
		{ iterations: 25, warmupIterations: 3 },
	);

	bench(
		'v3 vs v4 parity (minimal plugins)',
		async () => {
			resetBody();
			const v3Node = createDraggableNode();
			const v4Node = createDraggableNode();
			v4Node.style.left = v3Node.style.left;
			v4Node.style.top = v3Node.style.top;

			const v3Factory = new DraggableFactory({ ...DEFAULTS, plugins: MINIMAL_V3 });
			const v4Engine = createEngine({ plugins: MINIMAL_V4 });

			const d1 = v3Factory.draggable(v3Node, []);
			const d2 = v4Engine.draggable(v4Node, []);

			simulateDragSteps(v3Node, DRAG);
			simulateDragSteps(v4Node, DRAG);
			await flushEffects();

			const a = parseTranslate(v3Node);
			const b = parseTranslate(v4Node);
			if (Math.abs(a.x - b.x) > 0.5 || Math.abs(a.y - b.y) > 0.5) {
				throw new Error(`v3/v4 parity failed: v3=(${a.x},${a.y}) v4=(${b.x},${b.y})`);
			}
			assertTranslate(v3Node, DRAG.expected);
			assertTranslate(v4Node, DRAG.expected);

			d1();
			d2();
			v3Factory.dispose();
			v4Engine.dispose();
		},
		{ iterations: 15, warmupIterations: 2 },
	);
});

describe('behavioral — repeated drag stability', () => {
	bench(
		'v3 five consecutive identical drags',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const factory = new DraggableFactory({ ...DEFAULTS, plugins: MINIMAL_V3 });
			const dispose = factory.draggable(node, []);

			for (let i = 0; i < 5; i++) {
				simulateDragSteps(node, DRAG);
				await flushEffects();
				assertTranslate(node, DRAG.expected);
			}

			dispose();
			factory.dispose();
		},
		{ iterations: 10, warmupIterations: 1 },
	);

	bench(
		'v4 engine.update does not re-init same plugin keys',
		async () => {
			resetBody();
			const node = createDraggableNode();
			const engine = createEngine({ plugins: MINIMAL_V4 });
			let inits = 0;
			const pos = position({ current: { x: 0, y: 0 } });
			const origInit = pos.init!;
			pos.init = (ctx) => {
				inits++;
				return origInit(ctx);
			};

			engine.draggable(node, [iTransform, pos]);
			inits = 0;
			engine.update(node, [iTransform, position({ current: { x: 0, y: 0 } })]);
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
