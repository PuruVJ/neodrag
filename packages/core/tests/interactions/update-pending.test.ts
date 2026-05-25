/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag, type DragPlugin } from '../../src/index.ts';
import { position } from '../../src/plugins.ts';

describe('engine.update pending coalescing', () => {
	it('limits synchronous update nesting to MAX_UPDATE_DEPTH', () => {
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
		engine.update(node, [position({ current: { x: 99, y: 99 } }), makePing()]);

		expect(maxNest).toBeLessThanOrEqual(64);
		expect(calls).toBeGreaterThan(0);
		node.remove();
	});
});
