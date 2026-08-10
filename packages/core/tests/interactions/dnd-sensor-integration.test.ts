/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Drag } from '../../src/drag/drag.ts';
import {
	allFilters,
	buttonFilter,
	GamepadSensor,
	GAMEPAD_SENSOR_KEY,
	KEYBOARD_MOVE_SENSOR_KEY,
	KEYBOARD_SENSOR_KEY,
	KeyboardSensor,
	modifierFilter,
	POINTER_SENSOR_KEY,
	PointerSensor,
} from '../../src/sensors/index.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';
import { translate } from './_browser.ts';

function makeNode() {
	const node = document.createElement('div');
	node.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:100px';
	document.body.appendChild(node);
	return node;
}

describe('dnd/sensors barrel — real sensors integrate with the Interactions engine', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('re-exports the real pointer/keyboard sensor identities', () => {
		expect(POINTER_SENSOR_KEY).toBeTypeOf('symbol');
		expect(KEYBOARD_SENSOR_KEY).toBeTypeOf('symbol');
		expect(KEYBOARD_MOVE_SENSOR_KEY).toBeTypeOf('symbol');
		expect(GAMEPAD_SENSOR_KEY).toBeTypeOf('symbol');
		expect(new PointerSensor().key).toBe(POINTER_SENSOR_KEY);
		expect(new KeyboardSensor().key).toBe(KEYBOARD_SENSOR_KEY);
		expect(new GamepadSensor().key).toBe(GAMEPAD_SENSOR_KEY);
	});

	it('default Interactions engine installs pointer + keyboard sensors (pointer drag works)', () => {
		const dnd = new Interactions(); // default sensors
		const drag = new Drag();
		dnd.use(drag);
		const node = makeNode();
		drag.bind(node, {});

		const rect = node.getBoundingClientRect();
		// pointerdown must originate on the node so the capture-phase listener on the delegate
		// sees a composedPath that includes it; move/up are routed by pointerId.
		node.dispatchEvent(
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
				clientY: rect.top + 40,
				pointerId: 1,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: rect.left + 60,
				clientY: rect.top + 40,
				pointerId: 1,
			}),
		);

		expect(translate(node)).toEqual({ x: 50, y: 30 });
		dnd.dispose();
	});

	it('keyboard sensor cancels an active pointer drag via the Interactions engine', () => {
		const dnd = new Interactions();
		const drag = new Drag();
		dnd.use(drag);
		const node = makeNode();
		drag.bind(node, {});

		const rect = node.getBoundingClientRect();
		node.dispatchEvent(
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
				clientX: rect.left + 30,
				clientY: rect.top + 30,
				pointerId: 2,
			}),
		);
		expect(dnd.session).not.toBeNull();

		document.documentElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);
		expect(dnd.session).toBeNull();
		dnd.dispose();
	});

	it('a Interactions engine can be built with no default sensors and a custom sensor set', () => {
		const dnd = new Interactions({ defaultSensors: false });
		dnd.registerSensor(new PointerSensor());
		const drag = new Drag();
		dnd.use(drag);
		const node = makeNode();
		drag.bind(node, {});

		// Keyboard does nothing (no keyboard sensor) but pointer still drives.
		const rect = node.getBoundingClientRect();
		node.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				clientX: rect.left + 5,
				clientY: rect.top + 5,
				pointerId: 3,
				button: 0,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				clientX: rect.left + 25,
				clientY: rect.top + 5,
				pointerId: 3,
			}),
		);
		document.documentElement.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				clientX: rect.left + 25,
				clientY: rect.top + 5,
				pointerId: 3,
			}),
		);
		expect(translate(node)).toEqual({ x: 20, y: 0 });
		dnd.dispose();
	});

	it('filters re-exported from the barrel predicate correctly', () => {
		const f = allFilters(buttonFilter([0]), modifierFilter({ shift: true }));
		// A programmatic input has all-false modifiers → shift requirement fails.
		const prog = programmaticToInput({ phase: 'start', clientX: 0, clientY: 0 });
		expect(f(prog)).toBe(false);
		// buttonFilter passes non-pointer inputs through; modifierFilter with no constraints passes.
		expect(buttonFilter([0])(prog)).toBe(true);
		expect(modifierFilter({})(prog)).toBe(true);
	});
});
