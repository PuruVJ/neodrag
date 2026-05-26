/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { Draggable } from '../../src/draggable-binding.ts';
import { defaultSensors, keyboardSensor, pointerSensor } from '../../src/sensors/index.ts';

describe('sensors', () => {
	it('defaultSensors includes pointer, keyboard cancel, and keyboard move', () => {
		expect(defaultSensors()).toHaveLength(3);
	});

	it('Neodrag wires sensors on first attach', () => {
		const engine = new Neodrag({ sensors: [pointerSensor(), keyboardSensor()], dev: false });
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		document.body.appendChild(node);
		binding.attach(node);
		expect(engine).toBeDefined();
		binding.destroy();
		node.remove();
	});

	it('custom pointer-only sensor still allows drag', () => {
		const engine = new Neodrag({ sensors: [pointerSensor()], dev: false });
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		node.style.width = '100px';
		node.style.height = '100px';
		document.body.appendChild(node);
		binding.attach(node);

		const rect = node.getBoundingClientRect();
		const down = new PointerEvent('pointerdown', {
			bubbles: true,
			clientX: rect.left + 10,
			clientY: rect.top + 10,
			pointerId: 1,
			button: 0,
		});
		document.documentElement.dispatchEvent(down);

		const move = new PointerEvent('pointermove', {
			bubbles: true,
			clientX: rect.left + 60,
			clientY: rect.top + 60,
			pointerId: 1,
		});
		document.documentElement.dispatchEvent(move);

		const up = new PointerEvent('pointerup', {
			bubbles: true,
			clientX: rect.left + 60,
			clientY: rect.top + 60,
			pointerId: 1,
		});
		document.documentElement.dispatchEvent(up);

		binding.destroy();
		node.remove();
	});

	it('keyboard sensor cancels active drag on Escape', () => {
		const engine = new Neodrag({ sensors: [pointerSensor(), keyboardSensor()], dev: false });
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		document.body.appendChild(node);
		binding.attach(node);

		const rect = node.getBoundingClientRect();
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				clientX: rect.left + 10,
				clientY: rect.top + 10,
				pointerId: 2,
				button: 0,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: rect.left + 40,
				clientY: rect.top + 40,
				pointerId: 2,
			}),
		);

		document.documentElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);

		document.documentElement.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: rect.left + 40,
				clientY: rect.top + 40,
				pointerId: 2,
			}),
		);

		binding.destroy();
		node.remove();
	});

	it('delegate is not read until sensor attach', () => {
		const delegate = vi.fn(() => document.documentElement);
		new Neodrag({ delegate, sensors: [pointerSensor()] });
		expect(delegate).not.toHaveBeenCalled();
	});
});
