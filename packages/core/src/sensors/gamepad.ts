import {
	findKeyboardDragRoot,
	getKeyboardDragConfig,
	type ResolvedKeyboardDragOptions,
} from './keyboard.ts';
import { keyboardToInput } from '../interaction-input.ts';
import { SensorBase } from './base.ts';
import type { SensorHost } from './types.ts';

export const GAMEPAD_SENSOR_KEY = Symbol('neodrag.sensor.gamepad');

// Standard-mapping button indices (W3C Gamepad "standard" layout).
const BUTTON_A = 0; // south / cross — grab + commit
const BUTTON_B = 1; // east / circle — cancel
const DPAD_UP = 12;
const DPAD_DOWN = 13;
const DPAD_LEFT = 14;
const DPAD_RIGHT = 15;

// Left-stick axis indices in the standard mapping.
const AXIS_LX = 0;
const AXIS_LY = 1;

export interface GamepadSensorOptions {
	/** Stick magnitude below this is treated as centered. Default 0.25. */
	deadzone?: number;
	/**
	 * Velocity at full stick deflection, in `step` units per second. The accumulated
	 * sub-pixel travel is flushed to whole `step` moves so a half-held stick still moves.
	 * Default 12 (≈12 steps/s wide-open).
	 */
	speed?: number;
	/**
	 * Inject a poll source for testing (defaults to `navigator.getGamepads`). Lets a test
	 * feed a mocked gamepad without a real device or `navigator`.
	 */
	getGamepads?: () => (Gamepad | null)[];
	/** Inject a clock for testing (defaults to `performance.now`). */
	now?: () => number;
}

/** A live gamepad-driving session: `poll()` advances one frame, `stop()` tears it down. */
export interface GamepadSession {
	poll(): void;
	stop(): void;
}

type GamepadGrab = {
	node: HTMLElement | SVGElement;
	clientX: number;
	clientY: number;
	config: ResolvedKeyboardDragOptions;
	/** Fractional travel carried between polls, in `step` units, per axis. */
	carryX: number;
	carryY: number;
};

function centerOf(node: HTMLElement | SVGElement): { x: number; y: number } {
	const rect = node.getBoundingClientRect();
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Resolve the candidate draggable for a fresh grab: prefer the focused element's
// registered keyboard-drag root, mirroring the keyboard path so a pad drives the
// same nodes as the keyboard.
function focusedRoot(): HTMLElement | SVGElement | null {
	const active = typeof document !== 'undefined' ? document.activeElement : null;
	return findKeyboardDragRoot(active);
}

/**
 * Polls connected gamepads each frame and maps the left stick + dpad to keyboard-style
 * move inputs, A to grab/commit and B to cancel — driving the engine with the same
 * `keyboardToInput` payloads the keyboard sensor uses, so a gamepad moves any node that's
 * registered for keyboard dragging. The pad never claims a node directly; it grabs whatever
 * keyboard-drag root currently holds focus, keeping it decoupled from the drag capability.
 */
export class GamepadSensor extends SensorBase {
	static readonly key = GAMEPAD_SENSOR_KEY;
	readonly key = GamepadSensor.key;

	readonly #deadzone: number;
	readonly #speed: number;
	readonly #getGamepads: () => (Gamepad | null)[];
	readonly #now: () => number;

	constructor(options: GamepadSensorOptions | null = {}) {
		super();
		this.#deadzone = options?.deadzone ?? 0.25;
		this.#speed = options?.speed ?? 12;
		const provided = options?.getGamepads;
		this.#getGamepads =
			provided ??
			(() =>
				typeof navigator !== 'undefined' && navigator.getGamepads
					? navigator.getGamepads()
					: []);
		this.#now = options?.now ?? (() => performance.now());
	}

	protected attach(host: SensorHost): () => void {
		const session = this.createSession(host);
		let rafId = requestAnimationFrame(function loop() {
			session.poll();
			rafId = requestAnimationFrame(loop);
		});
		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			session.stop();
		};
	}

	/**
	 * Build a poll-driven session without starting a rAF loop. `attach` uses this internally;
	 * tests use it to step the sensor deterministically with an injected `getGamepads`/`now`.
	 */
	createSession(host: SensorHost): GamepadSession {
		let grab: GamepadGrab | null = null;
		let lastPoll = this.#now();
		// Per-button edge state so a held button fires exactly once.
		const prevButtons = new Map<number, boolean>();

		const startGrab = (root: HTMLElement | SVGElement): void => {
			const config = getKeyboardDragConfig(root);
			if (!config) return;
			const center = centerOf(root);
			grab = { node: root, clientX: center.x, clientY: center.y, config, carryX: 0, carryY: 0 };
			host.onInteractionStart(
				keyboardToInput({
					phase: 'start',
					clientX: grab.clientX,
					clientY: grab.clientY,
					key: config.grabKey,
					target: root,
				}),
			);
		};

		const commitGrab = (): void => {
			if (!grab) return;
			host.onInteractionEnd(
				keyboardToInput({
					phase: 'end',
					clientX: grab.clientX,
					clientY: grab.clientY,
					key: grab.config.grabKey,
					target: grab.node,
				}),
			);
			grab = null;
		};

		const cancelGrab = (): void => {
			grab = null;
			host.cancelActive('cancel');
		};

		const emitMove = (g: GamepadGrab, dx: number, dy: number): void => {
			if (dx === 0 && dy === 0) return;
			g.clientX += dx;
			g.clientY += dy;
			host.onInteractionMove(
				keyboardToInput({
					phase: 'move',
					clientX: g.clientX,
					clientY: g.clientY,
					key: 'Gamepad',
					delta: { x: dx, y: dy },
					target: g.node,
					repeat: true,
				}),
			);
		};

		// True only on the frame a button transitions released → pressed.
		const pressedEdge = (pad: Gamepad, index: number): boolean => {
			const down = pad.buttons[index]?.pressed ?? false;
			const was = prevButtons.get(index) ?? false;
			prevButtons.set(index, down);
			return down && !was;
		};

		// Apply the stick deadzone, rescaling the live range so motion ramps from 0 at the
		// deadzone edge rather than snapping in. Returns a value in [-1, 1].
		const applyDeadzone = (v: number): number => {
			const mag = Math.abs(v);
			if (mag <= this.#deadzone) return 0;
			const scaled = (mag - this.#deadzone) / (1 - this.#deadzone);
			return Math.sign(v) * scaled;
		};

		const firstConnected = (): Gamepad | null => {
			for (const p of this.#getGamepads()) {
				if (p && p.connected !== false) return p;
			}
			return null;
		};

		const poll = (): void => {
			const now = this.#now();
			const dt = Math.max(0, (now - lastPoll) / 1000);
			lastPoll = now;

			const pad = firstConnected();
			if (!pad) {
				if (prevButtons.size) prevButtons.clear();
				return;
			}

			// Grab / commit on A, cancel on B (edge-detected so a held button is one event).
			const aEdge = pressedEdge(pad, BUTTON_A);
			const bEdge = pressedEdge(pad, BUTTON_B);

			if (bEdge && grab) {
				cancelGrab();
			} else if (aEdge) {
				if (grab) commitGrab();
				else {
					const root = focusedRoot();
					if (root) startGrab(root);
				}
			}

			if (!grab) return;
			const config = grab.config;
			const axis = config.axis;

			// Stick: continuous, velocity-based. Dpad: discrete, full deflection while held.
			let nx = applyDeadzone(pad.axes[AXIS_LX] ?? 0);
			let ny = applyDeadzone(pad.axes[AXIS_LY] ?? 0);
			if (pad.buttons[DPAD_LEFT]?.pressed) nx = -1;
			else if (pad.buttons[DPAD_RIGHT]?.pressed) nx = 1;
			if (pad.buttons[DPAD_UP]?.pressed) ny = -1;
			else if (pad.buttons[DPAD_DOWN]?.pressed) ny = 1;

			if (axis === 'x') ny = 0;
			if (axis === 'y') nx = 0;

			grab.carryX += nx * this.#speed * dt;
			grab.carryY += ny * this.#speed * dt;

			const stepsX = Math.trunc(grab.carryX);
			const stepsY = Math.trunc(grab.carryY);
			if (stepsX !== 0 || stepsY !== 0) {
				grab.carryX -= stepsX;
				grab.carryY -= stepsY;
				emitMove(grab, stepsX * config.step, stepsY * config.step);
			}
		};

		return {
			poll,
			stop() {
				prevButtons.clear();
				grab = null;
			},
		};
	}
}
