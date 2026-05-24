/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, position, type DragPlugin } from '../../src/interactions/index.ts';

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

		const plugins = [pos];
		engine.draggable(node, plugins);
		initCalls = 0;

		engine.update(node, plugins);
		engine.update(node, plugins);
		expect(initCalls).toBe(0);

		node.remove();
	});

	it('stops synchronous re-entry at MAX_UPDATE_DEPTH (64)', () => {
		const engine = new Neodrag({ dev: false });
		const node = document.createElement('div');
		document.body.appendChild(node);

		let calls = 0;
		let maxNest = 0;
		let nest = 0;
		const PING_KEY = Symbol('ping');
		const makePing = (): DragPlugin => ({
			key: PING_KEY,
			name: 'ping',
			update() {
				calls++;
				nest++;
				maxNest = Math.max(maxNest, nest);
				if (calls <= 80) {
					engine.update(node, [
										position({ current: { x: calls, y: calls } }),
						makePing(),
					]);
				}
				nest--;
			},
		});

		engine.draggable(node, [position({ current: { x: 0, y: 0 } }), makePing()]);
		calls = 0;
		engine.update(node, [position({ current: { x: 1, y: 1 } }), makePing()]);

		expect(maxNest).toBeLessThanOrEqual(64);
		expect(calls).toBeGreaterThan(0);
		node.remove();
	});
});
