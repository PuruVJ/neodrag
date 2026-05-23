/**
 * Behavioral correctness guards in real Chromium.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULTS, Neodrag, position, threshold, transform } from '../../src/index.ts';
import {
	assertTranslate,
	createBox,
	dragSteps,
	flushEffects,
	parseTranslate,
	resetBody,
} from './helpers.ts';

const DRAG = {
	fromX: 120,
	fromY: 120,
	toX: 220,
	toY: 220,
	steps: 16,
	expected: { x: 100, y: 100 },
};

describe('Chromium behavioral guards', () => {
	it('default drag reaches expected translate', async () => {
		resetBody();
		const box = createBox();
		const engine = new Neodrag({ dev: false });
		const handle = engine.draggable(box, []);
		dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
		await flushEffects();
		assertTranslate(box, DRAG.expected);
		handle.destroy();
		engine.dispose();
	});

	it('minimal stack reaches expected translate', async () => {
		resetBody();
		const box = createBox();
		const engine = new Neodrag({
			plugins: [transform, position({ current: { x: 0, y: 0 } })],
			dev: false,
		});
		const handle = engine.draggable(box, [threshold(null)]);
		dragSteps(box, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
		await flushEffects();
		assertTranslate(box, DRAG.expected);
		handle.destroy();
		engine.dispose();
	});

	it('two boxes on one engine agree on translate', async () => {
		resetBody();
		const a = createBox('100px', '100px');
		const b = createBox('300px', '100px');
		const engine = new Neodrag({ plugins: DEFAULTS.plugins, dev: false });
		const h1 = engine.draggable(a, []);
		const h2 = engine.draggable(b, []);

		dragSteps(a, DRAG.fromX, DRAG.fromY, DRAG.toX, DRAG.toY, DRAG.steps);
		dragSteps(b, 320, DRAG.fromY, 420, DRAG.toY, DRAG.steps);
		await flushEffects();

		const ta = parseTranslate(a);
		const tb = parseTranslate(b);
		expect(Math.abs(ta.x - tb.x)).toBeLessThan(2);
		expect(Math.abs(ta.y - tb.y)).toBeLessThan(2);

		h1.destroy();
		h2.destroy();
		engine.dispose();
	});
});
