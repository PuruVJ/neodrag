/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { defineDropPlugin, Neodrag } from '../../src/index.ts';

describe('engine.updateDrop symbol-keyed diff', () => {
	it('calls update when same plugin key gets new options object', () => {
		const engine = new Neodrag();
		let updateCalls = 0;
		const node = document.createElement('div');
		document.body.appendChild(node);

		const key = Symbol('opts');
		const makePlugin = (label: string) =>
			defineDropPlugin(() => ({
				key,
				init() {
					return { label };
				},
				update() {
					updateCalls++;
				},
			}))();

		engine.droppable(node, [makePlugin('a')]);
		updateCalls = 0;
		engine.updateDrop(node, [makePlugin('b')]);
		expect(updateCalls).toBe(1);

		node.remove();
	});

	it('no-ops when resolved plugin list reference unchanged', () => {
		const engine = new Neodrag();
		let initCalls = 0;
		const node = document.createElement('div');
		document.body.appendChild(node);

		const plugin = defineDropPlugin(() => ({
			key: Symbol('once'),
			init() {
				initCalls++;
			},
		}))();

		const plugins = [plugin];
		engine.droppable(node, plugins);
		initCalls = 0;
		engine.updateDrop(node, plugins);
		expect(initCalls).toBe(0);

		node.remove();
	});
});
