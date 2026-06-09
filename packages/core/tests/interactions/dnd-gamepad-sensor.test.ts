/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Drag } from '../../src/drag/drag.ts';
import {
	GamepadSensor,
	GAMEPAD_SENSOR_KEY,
	type GamepadSession,
} from '../../src/sensors/gamepad.ts';
import { keyboardDraggable } from '../../src/sensors/keyboard.ts';
import type { InteractionInput } from '../../src/interaction-input.ts';
import type { SensorHost } from '../../src/sensors/types.ts';

// Build a W3C "standard"-mapping Gamepad shape with only the fields the sensor reads.
function mockGamepad(opts: {
	buttons?: Record<number, boolean>;
	axes?: number[];
}): Gamepad {
	const buttonStates = new Array(17).fill(null).map((_, i) => ({
		pressed: opts.buttons?.[i] ?? false,
		touched: opts.buttons?.[i] ?? false,
		value: opts.buttons?.[i] ? 1 : 0,
	})) as unknown as readonly GamepadButton[];
	const axes = [0, 0, 0, 0];
	if (opts.axes) for (let i = 0; i < opts.axes.length; i++) axes[i] = opts.axes[i];
	return {
		id: 'mock',
		index: 0,
		connected: true,
		mapping: 'standard',
		timestamp: 0,
		buttons: buttonStates,
		axes,
		vibrationActuator: null,
		hapticActuators: [],
	} as unknown as Gamepad;
}

// A minimal SensorHost that records every input the sensor pushes, plus cancel reasons.
function recordingHost(): SensorHost & { inputs: InteractionInput[]; cancels: string[] } {
	const inputs: InteractionInput[] = [];
	const cancels: string[] = [];
	return {
		inputs,
		cancels,
		getDelegate: () => document.documentElement,
		setPointerDisarm: () => {},
		onInteractionStart: (i) => inputs.push(i),
		onInteractionMove: (i) => inputs.push(i),
		onInteractionEnd: (i) => inputs.push(i),
		cancelActive: (r) => cancels.push(r),
	};
}

// Register + focus a keyboard-draggable node so the pad has a grab target.
function focusableNode(step = 10, axis: 'x' | 'y' | null = null) {
	const node = document.createElement('div');
	node.tabIndex = 0;
	node.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:100px';
	document.body.appendChild(node);
	const handle = keyboardDraggable(node, { step, axis });
	node.focus();
	return { node, handle };
}

describe('GamepadSensor', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('exposes the standard sensor identity', () => {
		const sensor = new GamepadSensor();
		expect(sensor.key).toBe(GAMEPAD_SENSOR_KEY);
		expect(GamepadSensor.key).toBe(GAMEPAD_SENSOR_KEY);
	});

	it('grabs the focused draggable when A is pressed and emits a start input', () => {
		const { handle } = focusableNode();
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => t });
		const host = recordingHost();
		const session = sensor.createSession(host);

		frame = mockGamepad({});
		session.poll(); // idle
		expect(host.inputs).toHaveLength(0);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } }); // A down
		session.poll();
		expect(host.inputs).toHaveLength(1);
		expect(host.inputs[0].phase).toBe('start');

		handle.destroy();
	});

	it('emits move inputs from left-stick deflection while grabbed', () => {
		const { handle } = focusableNode(10);
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({
			getGamepads: () => [frame],
			now: () => t,
			speed: 12,
		});
		const host = recordingHost();
		const session = sensor.createSession(host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } }); // grab
		session.poll();

		// Hold the stick full-right for a full second of accumulated dt → many steps flushed.
		frame = mockGamepad({ axes: [1, 0] });
		for (let i = 0; i < 60; i++) {
			t += 1000 / 60;
			session.poll();
		}

		const moves = host.inputs.filter((i) => i.phase === 'move');
		expect(moves.length).toBeGreaterThan(0);
		// Every move carries a positive-x, zero-y delta of whole `step` multiples.
		for (const m of moves) {
			expect(m.delta!.x).toBeGreaterThan(0);
			expect(m.delta!.x % 10).toBe(0);
			expect(m.delta!.y).toBe(0);
		}
		handle.destroy();
	});

	it('applies the deadzone — a barely-deflected stick produces no movement', () => {
		const { handle } = focusableNode(10);
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({
			getGamepads: () => [frame],
			now: () => t,
			deadzone: 0.5,
			speed: 12,
		});
		const host = recordingHost();
		const session = sensor.createSession(host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } });
		session.poll();

		// 0.3 < deadzone 0.5 → treated as centered.
		frame = mockGamepad({ axes: [0.3, 0] });
		for (let i = 0; i < 60; i++) {
			t += 1000 / 60;
			session.poll();
		}
		expect(host.inputs.filter((i) => i.phase === 'move')).toHaveLength(0);
		handle.destroy();
	});

	it('maps the dpad to discrete full-deflection moves', () => {
		const { handle } = focusableNode(10);
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({
			getGamepads: () => [frame],
			now: () => t,
			speed: 12,
		});
		const host = recordingHost();
		const session = sensor.createSession(host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } });
		session.poll();

		// Dpad-down held: button index 13.
		frame = mockGamepad({ buttons: { 13: true } });
		for (let i = 0; i < 60; i++) {
			t += 1000 / 60;
			session.poll();
		}
		const moves = host.inputs.filter((i) => i.phase === 'move');
		expect(moves.length).toBeGreaterThan(0);
		for (const m of moves) {
			expect(m.delta!.y).toBeGreaterThan(0);
			expect(m.delta!.x).toBe(0);
		}
		handle.destroy();
	});

	it('honours an axis lock — y is suppressed for an x-only node', () => {
		const { handle } = focusableNode(10, 'x');
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => t, speed: 12 });
		const host = recordingHost();
		const session = sensor.createSession(host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } });
		session.poll();

		// Diagonal stick — only x should survive.
		frame = mockGamepad({ axes: [1, 1] });
		for (let i = 0; i < 60; i++) {
			t += 1000 / 60;
			session.poll();
		}
		const moves = host.inputs.filter((i) => i.phase === 'move');
		expect(moves.length).toBeGreaterThan(0);
		for (const m of moves) {
			expect(m.delta!.x).toBeGreaterThan(0);
			expect(m.delta!.y).toBe(0);
		}
		handle.destroy();
	});

	it('commits the grab with a second A press (emits end)', () => {
		const { handle } = focusableNode(10);
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => t });
		const host = recordingHost();
		const session = sensor.createSession(host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } }); // grab
		session.poll();
		// release A so the next press is a fresh edge
		t = 32;
		frame = mockGamepad({});
		session.poll();
		t = 48;
		frame = mockGamepad({ buttons: { 0: true } }); // commit
		session.poll();

		const ends = host.inputs.filter((i) => i.phase === 'end');
		expect(ends).toHaveLength(1);
		handle.destroy();
	});

	it('cancels the grab with B (calls cancelActive, no end input)', () => {
		const { handle } = focusableNode(10);
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => t });
		const host = recordingHost();
		const session = sensor.createSession(host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } }); // grab
		session.poll();
		t = 32;
		frame = mockGamepad({ buttons: { 1: true } }); // B
		session.poll();

		expect(host.cancels).toEqual(['cancel']);
		expect(host.inputs.filter((i) => i.phase === 'end')).toHaveLength(0);
		handle.destroy();
	});

	it('treats a held A as a single edge (does not re-grab every frame)', () => {
		const { handle } = focusableNode(10);
		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => t });
		const host = recordingHost();
		const session = sensor.createSession(host);

		frame = mockGamepad({ buttons: { 0: true } });
		for (let i = 0; i < 5; i++) {
			t += 16;
			session.poll();
		}
		// First frame grabs (start). Second frame would be a fresh A-edge if not de-bounced,
		// but held A is the same edge, so only one start, no spurious commit/end.
		expect(host.inputs.filter((i) => i.phase === 'start')).toHaveLength(1);
		expect(host.inputs.filter((i) => i.phase === 'end')).toHaveLength(0);
		handle.destroy();
	});

	it('does nothing when no gamepad is connected', () => {
		focusableNode();
		const sensor = new GamepadSensor({ getGamepads: () => [null], now: () => 0 });
		const host = recordingHost();
		const session = sensor.createSession(host);
		session.poll();
		session.poll();
		expect(host.inputs).toHaveLength(0);
		expect(host.cancels).toHaveLength(0);
	});

	it('does not grab when nothing focusable is registered', () => {
		// A node exists but is not keyboard-draggable, and body has focus.
		const node = document.createElement('div');
		document.body.appendChild(node);
		let frame = mockGamepad({ buttons: { 0: true } });
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => 0 });
		const host = recordingHost();
		const session = sensor.createSession(host);
		session.poll();
		expect(host.inputs).toHaveLength(0);
		void frame;
	});

	it('drives a real Drag capability end-to-end through the Interactions engine', () => {
		const dnd = new Interactions();
		const drag = new Drag();
		dnd.use(drag);

		const node = document.createElement('div');
		node.tabIndex = 0;
		node.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:100px';
		document.body.appendChild(node);
		drag.bind(node, {});
		keyboardDraggable(node, { step: 10 });
		node.focus();

		let frame: Gamepad;
		let t = 0;
		const sensor = new GamepadSensor({ getGamepads: () => [frame], now: () => t, speed: 12 });
		const session: GamepadSession = sensor.createSession(dnd.host);

		t = 16;
		frame = mockGamepad({ buttons: { 0: true } }); // grab → engine start
		session.poll();

		frame = mockGamepad({ axes: [1, 0] }); // push right
		for (let i = 0; i < 60; i++) {
			t += 1000 / 60;
			session.poll();
		}

		// Commit.
		frame = mockGamepad({});
		t += 16;
		session.poll();
		t += 16;
		frame = mockGamepad({ buttons: { 0: true } });
		session.poll();

		expect(node.style.translate).not.toBe('');
		const x = parseFloat(node.style.translate.split(' ')[0]);
		expect(x).toBeGreaterThan(0);
		dnd.dispose();
	});
});
