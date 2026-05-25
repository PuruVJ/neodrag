/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { Neodrag } from '../../src/engine.ts';
import { Draggable } from '../../src/draggable-binding.ts';

describe('engine delegate wiring', () => {
	it('Neodrag constructor does not invoke delegate', () => {
		const delegate = vi.fn(() => document.documentElement);
		new Neodrag({ delegate });
		expect(delegate).not.toHaveBeenCalled();
	});

	it('Draggable without attach does not invoke delegate', () => {
		const delegate = vi.fn(() => document.documentElement);
		const engine = new Neodrag({ delegate });
		new Draggable({ engine, plugins: [] });
		expect(delegate).not.toHaveBeenCalled();
	});

	it('Draggable attach invokes delegate once', () => {
		const delegate = vi.fn(() => document.documentElement);
		const engine = new Neodrag({ delegate });
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		document.body.appendChild(node);
		binding.attach(node);
		expect(delegate).toHaveBeenCalledTimes(1);
		binding.destroy();
		node.remove();
	});
});
