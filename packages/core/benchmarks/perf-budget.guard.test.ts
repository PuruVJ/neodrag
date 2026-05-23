/**
 * @vitest-environment jsdom
 * Regression guard: steady-state drag must stay within a coarse time budget.
 */
import { describe, expect, it } from 'vitest';
import { MINIMAL_DRAG_PLUGINS, Neodrag } from '../src/index.ts';
import { createDraggableNode, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

const DRAG = { fromX: 120, fromY: 120, toX: 220, toY: 220, steps: 12 };
const ITERATIONS = 80;
const BUDGET_MS_PER_DRAG = 2.5;

function meanDragMs(plugins: typeof MINIMAL_DRAG_PLUGINS | undefined) {
	resetBody();
	const node = createDraggableNode();
	const engine = plugins ? new Neodrag({ plugins }) : new Neodrag();
	engine.draggable(node, []);
	const t0 = performance.now();
	for (let i = 0; i < ITERATIONS; i++) {
		simulateDragSteps(node, DRAG);
	}
	return (performance.now() - t0) / ITERATIONS;
}

describe('perf budgets', () => {
	it('default plugin stack 12-step drag', () => {
		const mean = meanDragMs(undefined);
		console.log(`[perf budget] default mean ${mean.toFixed(3)}ms/drag (budget ${BUDGET_MS_PER_DRAG}ms)`);
		expect(mean).toBeLessThan(BUDGET_MS_PER_DRAG);
	});

	it('minimal plugin stack 12-step drag', () => {
		const mean = meanDragMs(MINIMAL_DRAG_PLUGINS);
		console.log(`[perf budget] minimal mean ${mean.toFixed(3)}ms/drag (budget ${BUDGET_MS_PER_DRAG}ms)`);
		expect(mean).toBeLessThan(BUDGET_MS_PER_DRAG);
	});
});
