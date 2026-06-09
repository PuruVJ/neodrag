import {
	interactionPointerId,
	isPointerInput,
	type InteractionInput,
} from './interaction-input.ts';
import { installDefaultSensors } from './sensors/defaults.ts';
import type { Sensor, SensorHost } from './sensors/types.ts';
import type { EndReason } from './types.ts';
import type { Capability, InteractionsOptions, InteractionSession } from './types.ts';

const defaultDelegate = () => document.documentElement;

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
	readonly #defaultSensors: boolean;
	readonly host: SensorHost;

	#observers: Capability[] = [];
	#sensorsInstalled = false;
	#pointerDisarm: (() => void) | null = null;
	#session: InteractionSession | null = null;
	#activePointerId: number | null = null;
	#capturedNode: Element | null = null;
	#capturedPointerId = -1;

	constructor(options: InteractionsOptions = {}) {
		this.#delegate = options.delegate ?? defaultDelegate;
		this.#defaultSensors = options.defaultSensors !== false;
		this.host = {
			getDelegate: () => this.#delegate(),
			setPointerDisarm: (disarm) => {
				this.#pointerDisarm = disarm;
			},
			onInteractionStart: (input) => this.#onStart(input),
			onInteractionMove: (input) => this.#onMove(input),
			onInteractionEnd: (input) => this.#onEnd(input),
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
		this.#ensureSensors();
		return this;
	}

	registerSensor(sensor: Sensor): this {
		if (!this.#sensors.some((s) => s.key === sensor.key)) this.#sensors.push(sensor);
		if (this.#sensorsInstalled && !this.#cleanups.has(sensor.key)) {
			this.#cleanups.set(sensor.key, sensor.setup(this.host));
		}
		return this;
	}

	dispose(): void {
		if (this.#session) this.#finish('cancel');
		for (const cleanup of this.#cleanups.values()) cleanup();
		this.#cleanups.clear();
		this.#sensorsInstalled = false;
		this.#pointerDisarm = null;
	}

	#ensureSensors(): void {
		if (this.#sensorsInstalled) return;
		this.#sensorsInstalled = true;
		if (this.#defaultSensors && this.#sensors.length === 0) {
			installDefaultSensors((sensor) => this.#sensors.push(sensor));
		}
		for (const sensor of this.#sensors) {
			if (!this.#cleanups.has(sensor.key)) this.#cleanups.set(sensor.key, sensor.setup(this.host));
		}
	}

	#onStart(input: InteractionInput): void {
		if (this.#session) return;
		if (isPointerInput(input) && input.pointer.button === 2) return;

		for (const capability of this.#capabilities) {
			const target = capability.resolve(input);
			if (!target) continue;
			this.#activePointerId = interactionPointerId(input);
			this.#session = {
				capability,
				target,
				pointerId: this.#activePointerId,
				startInput: input,
				input,
				started: false,
				end: (reason) => this.#finish(reason),
			};
			return;
		}
	}

	#onMove(input: InteractionInput): void {
		const session = this.#session;
		if (!session) return;
		if (this.#activePointerId !== null && interactionPointerId(input) !== this.#activePointerId) {
			return;
		}
		session.input = input;

		if (!session.started) {
			const pass = session.capability.shouldStart?.(session) ?? true;
			if (!pass) return;
			session.started = true;
			session.capability.start(session);
			if (isPointerInput(input)) {
				try {
					const node = session.target.node as Element;
					node.setPointerCapture?.(input.pointer.pointerId);
					this.#capturedNode = node;
					this.#capturedPointerId = input.pointer.pointerId;
				} catch {
					/* capture is best-effort */
				}
			}
			this.#notify(session, 'start');
		}

		session.capability.move(session);
		this.#notify(session, 'move');
	}

	#onEnd(input: InteractionInput): void {
		const session = this.#session;
		if (!session) return;
		if (this.#activePointerId !== null && interactionPointerId(input) !== this.#activePointerId) {
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
		this.#activePointerId = null;
		this.#releaseCapture();
		if (session.started) {
			session.capability.end(session, reason);
			this.#notify(session, 'end', reason);
		}
		this.#pointerDisarm?.();
	}

	// Explicitly hand the pointer back. Browsers auto-release implicit capture on pointerup, but
	// not on cancel/programmatic end — so we release ourselves (guarded; release is best-effort).
	#releaseCapture(): void {
		const node = this.#capturedNode;
		if (!node) return;
		const id = this.#capturedPointerId;
		this.#capturedNode = null;
		this.#capturedPointerId = -1;
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
