/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { position } from '../../src/plugins.ts';

describe('engine.update preserves default plugins', () => {
	it('keeps built-in plugins after reconciling user plugins', () => {
		const engine = new Neodrag();
		const node = document.createElement('div');
		document.body.appendChild(node);

		const handle = engine.draggable(node, [position({ current: { x: 0, y: 0 } })]);
		expect(node.dataset.neodrag).toBe('');
		expect(node.dataset.neodragState).toBe('idle');

		handle.update([position({ current: { x: 5, y: 5 } })]);

		expect(node.dataset.neodrag).toBe('');
		expect(node.dataset.neodragState).toBe('idle');

		handle.destroy();
		node.remove();
	});
});
