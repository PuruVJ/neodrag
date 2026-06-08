/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/engine/neodrag.ts';
import { defineDragPlugin, defineDropPlugin } from '../../src/types.ts';

describe('named plugin keys (dev)', () => {
	it('throws when drag plugin uses anonymous Symbol in dev mode', () => {
		const engine = new Neodrag({ plugins: [], dev: true });
		const node = document.createElement('div');
		document.body.appendChild(node);

		expect(() =>
			engine.draggable(node, [
				defineDragPlugin(() => ({
					key: Symbol(),
				}))(),
			]),
		).toThrow(/named Symbol/i);

		node.remove();
	});

	it('throws when drop plugin uses anonymous Symbol in dev mode', () => {
		const engine = new Neodrag({ plugins: [], dev: true });
		const node = document.createElement('div');
		document.body.appendChild(node);

		expect(() =>
			engine.droppable(node, [
				defineDropPlugin(() => ({
					key: Symbol(),
				}))(),
			]),
		).toThrow(/named Symbol/i);

		node.remove();
	});

	it('allows anonymous Symbol when dev is false', () => {
		const engine = new Neodrag({ plugins: [], dev: false });
		const node = document.createElement('div');
		document.body.appendChild(node);

		expect(() =>
			engine.draggable(node, [
				defineDragPlugin(() => ({
					key: Symbol(),
				}))(),
			]),
		).not.toThrow();

		node.remove();
	});

	it('accepts Symbol with description in dev mode', () => {
		const engine = new Neodrag({ plugins: [], dev: true });
		const node = document.createElement('div');
		document.body.appendChild(node);

		expect(() =>
			engine.draggable(node, [
				defineDragPlugin(() => ({
					key: Symbol('my-plugin'),
				}))(),
			]),
		).not.toThrow();

		node.remove();
	});
});
