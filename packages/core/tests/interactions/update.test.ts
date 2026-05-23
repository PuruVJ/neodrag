/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, position, transform } from '../../src/interactions/index.ts';

describe('engine.update symbol-keyed diff', () => {
	it('does not re-init when same plugin key gets new options object', () => {
		const engine = new Neodrag();
		let initCalls = 0;
		const node = document.createElement('div');
		document.body.appendChild(node);

		const pos = position({ current: { x: 0, y: 0 } });
		const origInit = pos.init;
		pos.init = (ctx) => {
			initCalls++;
			return origInit?.(ctx);
		};

		engine.draggable(node, [transform, pos]);
		initCalls = 0;
		engine.update(node, [transform, position({ current: { x: 10, y: 20 } })]);
		expect(initCalls).toBe(0);
		node.remove();
	});

	it('no-ops when plugin array reference unchanged', () => {
		const engine = new Neodrag();
		const node = document.createElement('div');
		document.body.appendChild(node);
		const plugins = [transform, position({ current: { x: 0, y: 0 } })];
		engine.draggable(node, plugins);
		engine.update(node, plugins);
		node.remove();
	});
});
