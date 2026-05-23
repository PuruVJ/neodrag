/**
 * @vitest-environment jsdom
 */
import { bench, describe } from 'vitest';
import { DEFAULTS, Neodrag, position, threshold, transform } from '../src/index.ts';
import { createDraggableNode, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

const MINIMAL = [transform, position({ current: { x: 0, y: 0 } })];

describe('drag loop (default plugin stack)', () => {
	bench(
		'Neodrag — 12-step drag (full setup per iter)',
		() => {
			resetBody();
			const node = createDraggableNode();
			const engine = new Neodrag();
			const handle = engine.draggable(node, []);
			simulateDragSteps(node, {
				fromX: 120,
				fromY: 120,
				toX: 220,
				toY: 220,
				steps: 12,
			});
			handle.destroy();
			engine.dispose();
		},
		{ iterations: 200, warmupIterations: 10 },
	);
});

describe('drag loop (minimal plugins)', () => {
	bench(
		'Neodrag minimal stack',
		() => {
			resetBody();
			const node = createDraggableNode();
			const engine = new Neodrag({ plugins: MINIMAL });
			const handle = engine.draggable(node, [threshold(null)]);
			simulateDragSteps(node, {
				fromX: 120,
				fromY: 120,
				toX: 220,
				toY: 220,
				steps: 12,
			});
			handle.destroy();
			engine.dispose();
		},
		{ iterations: 300, warmupIterations: 15 },
	);
});
