import { keyboardToInput } from '../interaction-input.ts';
import type { DndNode } from '../types.ts';
import { is_svg_element, is_svg_svg_element, listen } from '../utils.ts';
import { SensorBase } from './base.ts';
import type { KeyboardSensorOptions, SensorHost } from './types.ts';

/* ────────────────────────────────────────────────────────────────────────────
 * keyboard-drag registry (merged from ./keyboard-drag-registry.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

export type KeyboardDragAxis = 'x' | 'y' | null;

export type ResolvedKeyboardDragOptions = {
	grabKey: string;
	step: number;
	axis: KeyboardDragAxis;
	slowInterval: number;
	speedupDelay: number;
	fastInterval: number;
	fastStep: number;
};

export type KeyboardDragOptions = {
	grabKey?: string;
	step?: number;
	axis?: KeyboardDragAxis;
	slowInterval?: number;
	speedupDelay?: number;
	fastInterval?: number;
	fastStep?: number;
};

const registry = new WeakMap<HTMLElement | SVGElement, ResolvedKeyboardDragOptions>();

export function registerKeyboardDrag(
	node: HTMLElement | SVGElement,
	options: ResolvedKeyboardDragOptions,
): void {
	registry.set(node, options);
}

export function unregisterKeyboardDrag(node: HTMLElement | SVGElement): void {
	registry.delete(node);
}

export function getKeyboardDragConfig(
	node: HTMLElement | SVGElement,
): ResolvedKeyboardDragOptions | undefined {
	return registry.get(node);
}

export function findKeyboardDragRoot(target: EventTarget | null): HTMLElement | SVGElement | null {
	let el: Element | null =
		target instanceof Element
			? target
			: target instanceof Node
				? (target as Node).parentElement
				: null;
	while (el) {
		if (registry.has(el as HTMLElement)) return el as HTMLElement | SVGElement;
		el = el.parentElement;
	}
	const active = document.activeElement;
	if (active instanceof HTMLElement && registry.has(active)) return active;
	return null;
}

/* ────────────────────────────────────────────────────────────────────────────
 * keyboard auto-repeat (merged from ./keyboard-repeat.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

export type KeyboardRepeatTick = (fast: boolean) => void;

export type KeyboardRepeatHandle = {
	stop(): void;
};

export function startKeyboardRepeat(opts: {
	onTick: KeyboardRepeatTick;
	slowInterval: number;
	speedupDelay: number;
	fastInterval: number;
}): KeyboardRepeatHandle {
	let raf_id = 0;
	let last_tick = 0;
	let started_at = 0;
	let stopped = false;
	let fast = false;

	const loop = (now: number) => {
		if (stopped) return;
		if (!started_at) started_at = now;
		const interval = fast ? opts.fastInterval : opts.slowInterval;
		if (!fast && now - started_at >= opts.speedupDelay) {
			fast = true;
			last_tick = now;
		}
		if (now - last_tick >= interval) {
			last_tick = now;
			opts.onTick(fast);
		}
		raf_id = requestAnimationFrame(loop);
	};

	raf_id = requestAnimationFrame(loop);

	return {
		stop() {
			stopped = true;
			if (raf_id) cancelAnimationFrame(raf_id);
		},
	};
}

/* ────────────────────────────────────────────────────────────────────────────
 * KeyboardSensor — cancel-key sensor (merged from ./keyboard-sensor.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

export const KEYBOARD_SENSOR_KEY = Symbol('neodrag.sensor.keyboard');

export class KeyboardSensor extends SensorBase {
	static readonly key = KEYBOARD_SENSOR_KEY;
	readonly key = KeyboardSensor.key;
	readonly #cancel_keys: Set<string>;

	constructor(options: KeyboardSensorOptions | null = {}) {
		super();
		this.#cancel_keys = new Set(options?.cancelKeys ?? ['Escape']);
	}

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();

		const on_key_down = (e: KeyboardEvent) => {
			if (!this.#cancel_keys.has(e.key)) return;
			host.cancelActive('cancel');
		};

		const unlisten = listen(target, 'keydown', on_key_down, { passive: true });

		return unlisten;
	}
}

/* ────────────────────────────────────────────────────────────────────────────
 * KeyboardMoveSensor — grab + arrow-move sensor (merged from ./keyboard-move-sensor.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

export const KEYBOARD_MOVE_SENSOR_KEY = Symbol('neodrag.sensor.keyboardMove');

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

type GrabSession = {
	node: HTMLElement | SVGElement;
	clientX: number;
	clientY: number;
	config: ResolvedKeyboardDragOptions;
	repeat: ReturnType<typeof startKeyboardRepeat> | null;
	last_key: string;
};

function axis_delta(
	key: string,
	step: number,
	axis: ResolvedKeyboardDragOptions['axis'],
): { x: number; y: number } | null {
	let x = 0;
	let y = 0;
	if (key === 'ArrowLeft') x = -step;
	else if (key === 'ArrowRight') x = step;
	else if (key === 'ArrowUp') y = -step;
	else if (key === 'ArrowDown') y = step;
	else return null;
	if (axis === 'x') y = 0;
	if (axis === 'y') x = 0;
	return { x, y };
}

function center_of(node: HTMLElement | SVGElement) {
	const rect = node.getBoundingClientRect();
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function is_grab_key(key: string, grab_key: string): boolean {
	return key === grab_key || (grab_key === 'Space' && key === ' ');
}

export class KeyboardMoveSensor extends SensorBase {
	static readonly key = KEYBOARD_MOVE_SENSOR_KEY;
	readonly key = KeyboardMoveSensor.key;

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();
		let grab: GrabSession | null = null;

		const stop_repeat = () => {
			grab?.repeat?.stop();
			if (grab) grab.repeat = null;
		};

		const emit_move = (session: GrabSession, key: string, fast: boolean) => {
			const step = fast ? session.config.fastStep : session.config.step;
			const delta = axis_delta(key, step, session.config.axis);
			if (!delta) return;
			session.clientX += delta.x;
			session.clientY += delta.y;
			host.onInteractionMove(
				keyboardToInput({
					phase: 'move',
					clientX: session.clientX,
					clientY: session.clientY,
					key,
					delta,
					target: session.node,
					repeat: true,
				}),
			);
		};

		const release_grab = () => {
			if (!grab) return;
			stop_repeat();
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

		const on_key_down = (e: KeyboardEvent) => {
			if (e.defaultPrevented) return;

			if (e.key === 'Escape' && grab) {
				e.preventDefault();
				stop_repeat();
				grab = null;
				host.cancelActive('cancel');
				return;
			}

			const root = findKeyboardDragRoot(e.target);
			if (!root) {
				if (grab && is_grab_key(e.key, grab.config.grabKey)) {
					e.preventDefault();
					release_grab();
				}
				return;
			}

			const config = getKeyboardDragConfig(root)!;

			if (is_grab_key(e.key, config.grabKey)) {
				e.preventDefault();
				if (grab?.node === root) {
					release_grab();
					return;
				}
				if (grab) release_grab();

				const center = center_of(root);
				grab = {
					node: root,
					clientX: center.x,
					clientY: center.y,
					config,
					repeat: null,
					last_key: config.grabKey,
				};
				host.onInteractionStart(
					keyboardToInput({
						phase: 'start',
						clientX: grab.clientX,
						clientY: grab.clientY,
						key: e.key,
						target: root,
						native: e,
					}),
				);
				return;
			}

			if (!grab || grab.node !== root) return;
			if (!ARROW_KEYS.has(e.key)) return;

			e.preventDefault();
			grab.last_key = e.key;
			stop_repeat();

			if (!e.repeat) {
				emit_move(grab, e.key, false);
				return;
			}

			grab.repeat = startKeyboardRepeat({
				slowInterval: config.slowInterval,
				speedupDelay: config.speedupDelay,
				fastInterval: config.fastInterval,
				onTick: (fast) => {
					if (!grab) return;
					emit_move(grab, grab.last_key, fast);
				},
			});
		};

		const on_blur = () => {
			if (grab) release_grab();
		};

		const unlisten_key_down = listen(target, 'keydown', on_key_down, { passive: false });
		const unlisten_blur = listen(target, 'blur', on_blur, { passive: true, capture: true });

		return () => {
			stop_repeat();
			grab = null;
			unlisten_key_down();
			unlisten_blur();
		};
	}
}

export function isDraggableKeyboardTarget(el: Element): el is HTMLElement | SVGElement {
	return (
		(el instanceof HTMLElement || (is_svg_element(el) && !is_svg_svg_element(el))) &&
		getKeyboardDragConfig(el as HTMLElement) != null
	);
}

/* ────────────────────────────────────────────────────────────────────────────
 * keyboardDraggable — register a node as keyboard/gamepad movable
 * (merged from ./keyboard-draggable.ts)
 * ──────────────────────────────────────────────────────────────────────────── */

/**
 * Options for making a node keyboard- (and gamepad-) movable. A pixel `step` only here —
 * the v3 surface is options-only and px-based; any unit resolution lives in the framework
 * adapters, not the engine.
 */
export interface KeyboardDraggableOptions {
	/** Key (or 'Space') that grabs / releases the node. Default 'Space'. */
	grabKey?: string;
	/** Pixels moved per arrow press (slow phase). Default 1. */
	step?: number;
	/** Pixels per tick once auto-repeat speeds up. Default 4. */
	fastStep?: number;
	/** Constrain movement to a single axis. Default null (free). */
	axis?: KeyboardDragAxis;
	/** ms between repeats before speed-up kicks in. Default 400. */
	slowInterval?: number;
	/** ms a key must be held before repeats speed up. Default 800. */
	speedupDelay?: number;
	/** ms between repeats after speed-up. Default 50. */
	fastInterval?: number;
}

/** Handle for a keyboard-draggable registration — update the config or tear it down. */
export interface KeyboardDraggableHandle {
	update(options: KeyboardDraggableOptions): void;
	destroy(): void;
}

function resolve(options: KeyboardDraggableOptions): ResolvedKeyboardDragOptions {
	return {
		grabKey: options.grabKey ?? 'Space',
		step: options.step ?? 1,
		fastStep: options.fastStep ?? 4,
		axis: options.axis ?? null,
		slowInterval: options.slowInterval ?? 400,
		speedupDelay: options.speedupDelay ?? 800,
		fastInterval: options.fastInterval ?? 50,
	};
}

/**
 * Register `node` so the {@link KeyboardMoveSensor} (and {@link GamepadSensor}) can grab and
 * move it — the engine then routes the resulting inputs to whichever capability owns the node
 * (e.g. `Drag`). This is the v3 port of the legacy `keyboardDrag` plugin: it does the same
 * registry registration, minus the plugin lifecycle and unit-resolution plumbing.
 *
 * Ensure the node is focusable (`tabindex`) so it can receive the grab keystroke.
 */
export function keyboardDraggable(
	node: DndNode,
	options: KeyboardDraggableOptions = {},
): KeyboardDraggableHandle {
	let current = options;
	registerKeyboardDrag(node, resolve(current));
	return {
		update(next) {
			current = next;
			registerKeyboardDrag(node, resolve(current));
		},
		destroy() {
			unregisterKeyboardDrag(node);
		},
	};
}
