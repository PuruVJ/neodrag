/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, position, transform } from '../../src/interactions/index.ts';

describe('transform plugin update', () => {
	it('repaints translate after position plugin reconcile', () => {
		const engine = new Neodrag();
		const node = document.createElement('div');
		document.body.appendChild(node);

		const handle = engine.draggable(node, [
			transform,
			position({ current: { x: 0, y: 0 } }),
		]);

		handle.update([transform, position({ current: { x: 40, y: 50 } })]);

		const style = getComputedStyle(node).translate;
		expect(style).toContain('40');
		expect(style).toContain('50');

		handle.destroy();
		node.remove();
	});
});
