/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { Draggable } from '../../src/draggable-binding.ts';
import {
	KEYBOARD_MOVE_SENSOR_KEY,
	KEYBOARD_SENSOR_KEY,
	KeyboardMoveSensor,
	KeyboardSensor,
	POINTER_SENSOR_KEY,
	PointerSensor,
	installDefaultSensors,
} from '../../src/sensors/index.ts';

describe('sensor registration', () => {
	it('installs default sensors when defaultSensors is omitted', () => {
		const engine = new Neodrag({ dev: false });
		const keys = engine.getSensors().map((s) => s.key);
		expect(keys).toEqual([POINTER_SENSOR_KEY, KEYBOARD_SENSOR_KEY, KEYBOARD_MOVE_SENSOR_KEY]);
	});

	it('installs no sensors when defaultSensors is false', () => {
		const engine = new Neodrag({ defaultSensors: false, dev: false });
		expect(engine.getSensors()).toHaveLength(0);
	});

	it('registerSensor adds a sensor', () => {
		const engine = new Neodrag({ defaultSensors: false, dev: false });
		engine.registerSensor(new PointerSensor());
		expect(engine.getSensors()).toHaveLength(1);
		expect(engine.getSensors()[0]).toBeInstanceOf(PointerSensor);
	});

	it('registerSensor rejects duplicate keys', () => {
		const engine = new Neodrag({ dev: false });
		expect(() => engine.registerSensor(new PointerSensor())).toThrow(/already registered/);
	});

	it('unregisterSensor removes a sensor by key', () => {
		const engine = new Neodrag({ dev: false });
		engine.unregisterSensor(KEYBOARD_MOVE_SENSOR_KEY);
		expect(engine.getSensors().map((s) => s.key)).toEqual([
			POINTER_SENSOR_KEY,
			KEYBOARD_SENSOR_KEY,
		]);
	});

	it('installDefaultSensors registers the built-in trio', () => {
		const engine = new Neodrag({ defaultSensors: false, dev: false });
		installDefaultSensors((sensor) => engine.registerSensor(sensor));
		expect(engine.getSensors()).toHaveLength(3);
	});

	it('registerSensor after first attach wires listeners immediately', () => {
		const engine = new Neodrag({ defaultSensors: false, dev: false });
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		document.body.appendChild(node);
		binding.attach(node);

		engine.registerSensor(new PointerSensor());

		const rect = node.getBoundingClientRect();
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				clientX: rect.left + 10,
				clientY: rect.top + 10,
				pointerId: 99,
				button: 0,
			}),
		);

		binding.destroy();
		node.remove();
	});
});

describe('sensor behavior', () => {
	it('pointer sensor allows drag with pointer-only engine', () => {
		const engine = new Neodrag({ defaultSensors: false, dev: false });
		engine.registerSensor(new PointerSensor());
		const binding = new Draggable({ engine, plugins: [] });
		const node = document.createElement('div');
		node.style.width = '100px';
		node.style.height = '100px';
		document.body.appendChild(node);
		binding.attach(node);

		const rect = node.getBoundingClientRect();
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				clientX: rect.left + 10,
				clientY: rect.top + 10,
				pointerId: 1,
				button: 0,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: rect.left + 60,
				clientY: rect.top + 60,
				pointerId: 1,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: rect.left + 60,
				clientY: rect.top + 60,
				pointerId: 1,
			}),
		);

		binding.destroy();
		node.remove();
	});

	it('keyboard sensor cancels active drag on Escape', () => {
		const engine = new Neodrag({
			defaultSensors: false,
			dev: false,
		});
		engine.registerSensor(new PointerSensor());
		engine.registerSensor(new KeyboardSensor());

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
		const engine = new Neodrag({ delegate, defaultSensors: false, dev: false });
		engine.registerSensor(new PointerSensor());
		expect(delegate).not.toHaveBeenCalled();
	});
});
