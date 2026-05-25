import { describe, expect, it, vi } from 'vitest';
import { Neodrag } from '../../src/interactions/engine.ts';
import { Draggable } from '../../src/interactions/draggable-binding.ts';
import * as utils from '../../src/utils.ts';

describe('SSR-safe construction', () => {
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

	it('Draggable attachment is a no-op when not in a browser', () => {
		const delegate = vi.fn(() => document.documentElement);
		const engine = new Neodrag({ delegate });
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		const spy = vi.spyOn(utils, 'isBrowser').mockReturnValue(false);
		binding.attachment(node);
		expect(delegate).not.toHaveBeenCalled();
		spy.mockRestore();
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
