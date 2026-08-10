import {
	interactionPointerId,
	isPointerInput,
	type InteractionInput,
} from './interaction-input.ts';
import { installDefaultSensors } from './sensors/defaults.ts';
import { userSelectHack } from './user-select.ts';
import type { Sensor, SensorHost } from './sensors/types.ts';
import type { EndReason } from './types.ts';
import type { Capability, InteractionsOptions, InteractionSession } from './types.ts';

const default_delegate = () => document.documentElement;

/**
 * The semantics-free engine. It owns only the shared machinery — single document-level
 * sensor delegation, the session state, and routing pointer input to whichever capability
 * claims a node — and knows nothing about drag/drop/resize. Capabilities provide meaning.
 */
export class Interactions {
	readonly #capabilities: Capability[] = [];
	readonly #sensors: Sensor[] = [];
	readonly #cleanups = new Map<symbol, () => void>();
	readonly #delegate: () => HTMLElement;
	readonly #default_sensors: boolean;
	readonly host: SensorHost;

	#observers: Capability[] = [];
	#sensors_installed = false;
	#pointer_disarm: (() => void) | null = null;
	#session: InteractionSession | null = null;
	#active_pointer_id: number | null = null;
	#captured_node: Element | null = null;
	#captured_pointer_id = -1;

	constructor(options: InteractionsOptions = {}) {
		this.#delegate = options.delegate ?? default_delegate;
		this.#default_sensors = options.defaultSensors !== false;
		this.host = {
			getDelegate: () => this.#delegate(),
			setPointerDisarm: (disarm) => {
				this.#pointer_disarm = disarm;
			},
			onInteractionStart: (input) => this.#on_start(input),
			onInteractionMove: (input) => this.#on_move(input),
			onInteractionEnd: (input) => this.#on_end(input),
			cancelActive: (reason) => {
				if (this.#session) this.#finish(reason);
			},
		};
	}

	/** The active interaction, or null. Read-only view for capabilities/debug. */
	get session(): InteractionSession | null {
		return this.#session;
	}

	/** Compose capabilities into the engine. Returns `this` for chaining. */
	use(...capabilities: Capability[]): this {
		for (const cap of capabilities) this.#capabilities.push(cap);
		this.#capabilities.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
		this.#observers = this.#capabilities.filter((c) => typeof c.observe === 'function');
		this.#ensure_sensors();
		return this;
	}

	registerSensor(sensor: Sensor): this {
		if (!this.#sensors.some((s) => s.key === sensor.key)) this.#sensors.push(sensor);
		if (this.#sensors_installed && !this.#cleanups.has(sensor.key)) {
			this.#cleanups.set(sensor.key, sensor.setup(this.host));
		}
		return this;
	}

	dispose(): void {
		if (this.#session) this.#finish('cancel');
		for (const cleanup of this.#cleanups.values()) cleanup();
		this.#cleanups.clear();
		this.#sensors_installed = false;
		this.#pointer_disarm = null;
	}

	#ensure_sensors(): void {
		if (this.#sensors_installed) return;
		this.#sensors_installed = true;
		if (this.#default_sensors && this.#sensors.length === 0) {
			installDefaultSensors((sensor) => this.#sensors.push(sensor));
		}
		for (const sensor of this.#sensors) {
			if (!this.#cleanups.has(sensor.key)) this.#cleanups.set(sensor.key, sensor.setup(this.host));
		}
	}

	#on_start(input: InteractionInput): void {
		if (this.#session) return;
		if (isPointerInput(input) && input.pointer.button === 2) return;

		for (const capability of this.#capabilities) {
			const target = capability.resolve(input);
			if (!target) continue;
			this.#active_pointer_id = interactionPointerId(input);
			this.#session = {
				capability,
				target,
				pointerId: this.#active_pointer_id,
				startInput: input,
				input,
				started: false,
				end: (reason) => this.#finish(reason),
			};
			return;
		}
	}

	#on_move(input: InteractionInput): void {
		const session = this.#session;
		if (!session) return;
		if (this.#active_pointer_id !== null && interactionPointerId(input) !== this.#active_pointer_id) {
			return;
		}
		session.input = input;

		if (!session.started) {
			const pass = session.capability.shouldStart?.(session) ?? true;
			if (!pass) return;
			session.started = true;
			session.capability.start(session);
			// Centralized text-selection suppression: every gesture gets body `user-select: none`
			// (refcounted) unless its capability opted out via `session.userSelect = false` in start().
			if (session.userSelect !== false) userSelectHack.apply();
			if (isPointerInput(input)) {
				try {
					const node = session.target.node as Element;
					node.setPointerCapture?.(input.pointer.pointerId);
					this.#captured_node = node;
					this.#captured_pointer_id = input.pointer.pointerId;
				} catch {
					/* capture is best-effort */
				}
			}
			this.#notify(session, 'start');
		}

		session.capability.move(session);
		this.#notify(session, 'move');
	}

	#on_end(input: InteractionInput): void {
		const session = this.#session;
		if (!session) return;
		if (this.#active_pointer_id !== null && interactionPointerId(input) !== this.#active_pointer_id) {
			return;
		}
		session.input = input;
		this.#finish('no-target');
	}

	#finish(reason: EndReason): void {
		const session = this.#session;
		if (!session) return;
		// Settle engine state before teardown so re-entrant end() calls are no-ops.
		this.#session = null;
		this.#active_pointer_id = null;
		this.#release_capture();
		if (session.started) {
			session.capability.end(session, reason);
			if (session.userSelect !== false) userSelectHack.release();
			this.#notify(session, 'end', reason);
		}
		this.#pointer_disarm?.();
	}

	// Explicitly hand the pointer back. Browsers auto-release implicit capture on pointerup, but
	// not on cancel/programmatic end — so we release ourselves (guarded; release is best-effort).
	#release_capture(): void {
		const node = this.#captured_node;
		if (!node) return;
		const id = this.#captured_pointer_id;
		this.#captured_node = null;
		this.#captured_pointer_id = -1;
		try {
			if (node.hasPointerCapture?.(id)) node.releasePointerCapture?.(id);
		} catch {
			/* release is best-effort */
		}
	}

	#notify(session: InteractionSession, phase: 'start' | 'move' | 'end', reason?: EndReason): void {
		if (this.#observers.length === 0) return;
		for (const observer of this.#observers) {
			if (observer === session.capability) continue;
			observer.observe?.(session, phase, reason);
		}
	}
}
