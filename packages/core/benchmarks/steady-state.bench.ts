/**
 * @vitest-environment jsdom
 * Steady-state: engine created once; only pointer events per iteration.
 */
import { bench, describe } from 'vitest';
import { Neodrag } from '../src/index.ts';
import { createDraggableNode } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

describe('steady-state drag (amortized setup)', () => {
	const node = createDraggableNode();
	const engine = new Neodrag();
	engine.draggable(node, []);

	bench(
		'Neodrag — 12-step drag only',
		() => {
			simulateDragSteps(node, {
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
		'Neodrag — single pointermove while idle',
		() => {
			node.dispatchEvent(
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
