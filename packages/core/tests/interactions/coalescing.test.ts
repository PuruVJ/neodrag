/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, position, transform } from '../../src/interactions/index.ts';

describe('engine.update coalescing', () => {
	it('no-ops identical plugin list without re-initing plugins', () => {
		const engine = new Neodrag();
		const node = document.createElement('div');
		document.body.appendChild(node);

		const pos = position({ current: { x: 0, y: 0 } });
		let initCalls = 0;
		const origInit = pos.init!;
		pos.init = (ctx) => {
			initCalls++;
			return origInit(ctx);
		};

		const plugins = [transform, pos];
		engine.draggable(node, plugins);
		initCalls = 0;

		engine.update(node, plugins);
		engine.update(node, plugins);
		expect(initCalls).toBe(0);

		node.remove();
	});

	it('stops synchronous re-entry beyond depth limit', () => {
		const engine = new Neodrag({ dev: false });
		const node = document.createElement('div');
		document.body.appendChild(node);

		const ping = {
			key: Symbol('ping'),
			name: 'ping',
			update() {
				if (depth < 200) {
					depth++;
					engine.update(node, [transform, position({ current: { x: depth, y: depth } }), ping]);
				}
			},
		};
		let depth = 0;

		engine.draggable(node, [transform, position({ current: { x: 0, y: 0 } }), ping]);
		depth = 0;
		engine.update(node, [transform, position({ current: { x: 1, y: 1 } }), ping]);

		expect(depth).toBeLessThan(200);
		node.remove();
	});
});
