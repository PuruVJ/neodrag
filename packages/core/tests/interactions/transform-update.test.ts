/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { position } from '../../src/plugins.ts';

describe('built-in drag transform', () => {
	it('repaints translate after position plugin reconcile', () => {
		const engine = new Neodrag();
		const node = document.createElement('div');
		document.body.appendChild(node);

		const handle = engine.draggable(node, [position({ current: { x: 0, y: 0 } })]);

		handle.update([position({ current: { x: 40, y: 50 } })]);

		const style = getComputedStyle(node).translate;
		expect(style).toContain('40');
		expect(style).toContain('50');

		handle.destroy();
		node.remove();
	});
});
