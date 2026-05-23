/**
 * @vitest-environment jsdom
 */
import { bench, describe } from 'vitest';
import { DraggableFactory, DEFAULTS } from '../src/index.ts';
import { threshold, transform } from '../src/plugins.ts';
import { createEngine, position, transform as iTransform } from '../src/interactions/index.ts';
import { createDraggableNode, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

const MINIMAL_V3 = [transform(), threshold(null)];
const MINIMAL_V4 = [iTransform, position({ current: { x: 0, y: 0 } })];

describe('drag loop (default plugin stacks)', () => {
	bench(
		'v3 DraggableFactory — 12-step drag',
		() => {
			resetBody();
			const node = createDraggableNode();
			const factory = new DraggableFactory(DEFAULTS);
			const dispose = factory.draggable(node, []);
			simulateDragSteps(node, {
				fromX: 120,
				fromY: 120,
				toX: 220,
				toY: 220,
				steps: 12,
			});
			dispose();
			factory.dispose();
		},
		{ iterations: 200, warmupIterations: 10 },
	);

	bench(
		'v4 InteractionEngine — 12-step drag',
		() => {
			resetBody();
			const node = createDraggableNode();
			const engine = createEngine();
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

describe('drag loop (minimal plugins, threshold off)', () => {
	bench(
		'v3 minimal stack',
		() => {
			resetBody();
			const node = createDraggableNode();
			const factory = new DraggableFactory({ ...DEFAULTS, plugins: MINIMAL_V3 });
			const dispose = factory.draggable(node, []);
			simulateDragSteps(node, {
				fromX: 120,
				fromY: 120,
				toX: 220,
				toY: 220,
				steps: 12,
			});
			dispose();
			factory.dispose();
		},
		{ iterations: 300, warmupIterations: 15 },
	);

	bench(
		'v4 minimal stack',
		() => {
			resetBody();
			const node = createDraggableNode();
			const engine = createEngine({ plugins: MINIMAL_V4 });
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
		{ iterations: 300, warmupIterations: 15 },
	);
});
