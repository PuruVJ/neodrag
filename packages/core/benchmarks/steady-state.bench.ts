/**
 * @vitest-environment jsdom
 * Steady-state: factory created once; only pointer events per iteration.
 */
import { bench, describe } from 'vitest';
import { DraggableFactory, DEFAULTS } from '../src/index.ts';
import { createEngine } from '../src/interactions/index.ts';
import { createDraggableNode, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

describe('steady-state drag (amortized setup)', () => {
	const v3Node = createDraggableNode();
	const v3Factory = new DraggableFactory(DEFAULTS);
	const v3Dispose = v3Factory.draggable(v3Node, []);

	const v4Node = createDraggableNode();
	const v4Engine = createEngine();
	const v4Dispose = v4Engine.draggable(v4Node, []);

	bench(
		'v3 — 12-step drag only',
		() => {
			simulateDragSteps(v3Node, {
				fromX: 120,
				fromY: 120,
				toX: 220,
				toY: 220,
				steps: 12,
			});
		},
		{ iterations: 2000, warmupIterations: 100 },
	);

	bench(
		'v4 — 12-step drag only',
		() => {
			simulateDragSteps(v4Node, {
				fromX: 120,
				fromY: 120,
				toX: 220,
				toY: 220,
				steps: 12,
			});
		},
		{ iterations: 2000, warmupIterations: 100 },
	);

	bench(
		'v3 — single pointermove while idle',
		() => {
			v3Node.dispatchEvent(
				new PointerEvent('pointermove', {
					bubbles: true,
					clientX: 150,
					clientY: 150,
					pointerId: 1,
					pointerType: 'mouse',
				}),
			);
		},
		{ iterations: 50000, warmupIterations: 500 },
	);

	bench(
		'v4 — single pointermove while idle',
		() => {
			v4Node.dispatchEvent(
				new PointerEvent('pointermove', {
					bubbles: true,
					clientX: 150,
					clientY: 150,
					pointerId: 1,
					pointerType: 'mouse',
				}),
			);
		},
		{ iterations: 50000, warmupIterations: 500 },
	);
});
