import type { InteractionInput } from './interaction-input.ts';

export type EndReason = 'drop' | 'no-target' | 'cancel';

export type DndNode = HTMLElement | SVGElement;

/** What a capability returns when it claims a pointerdown. `data` is capability-private. */
export interface ResolvedTarget {
	node: DndNode;
	data?: unknown;
}

/** The live interaction the engine drives, handed to the owning capability each phase. */
export interface InteractionSession {
	readonly capability: Capability;
	readonly target: ResolvedTarget;
	readonly pointerId: number;
	readonly startInput: InteractionInput;
	/** Latest input for this interaction. */
	input: InteractionInput;
	/** Shared payload set by the owning capability (e.g. drag data), read by observers. */
	data?: unknown;
	/** True once the threshold gate has passed and `start()` has run. */
	started: boolean;
	/**
	 * Whether the engine suppresses body text-selection (`user-select: none`, refcounted) for the
	 * lifetime of this interaction. Defaults to `true` for every gesture; a capability sets it
	 * `false` in `start()` (e.g. from a `userSelect: false` option) to opt out.
	 */
	userSelect?: boolean;
	/** End this interaction from inside a capability (commit/cancel). */
	end(reason: EndReason): void;
}

/**
 * A capability is a peer interaction (drag, drop substrate, resize, sortable, …).
 * The engine knows nothing about their semantics — it only routes pointer input
 * to whichever capability claims a node, then drives the lifecycle.
 */
export interface Capability {
	readonly key: symbol;
	readonly name: string;
	/** Higher runs first in pointerdown routing (e.g. resize-handle > drag-body). Default 0. */
	readonly priority?: number;
	/** Claim a pointerdown: return the bound target this capability owns, or null to pass. */
	resolve(input: InteractionInput): ResolvedTarget | null;
	/** Threshold gate, checked on each pending move. Return false to stay pending. Default: pass. */
	shouldStart?(session: InteractionSession): boolean;
	/** Runs once when the threshold passes. */
	start(session: InteractionSession): void;
	/** Runs on every move after start. */
	move(session: InteractionSession): void;
	/** Runs once on pointerup/cancel. */
	end(session: InteractionSession, reason: EndReason): void;
	/**
	 * Optional: observe interactions owned by *another* capability (e.g. `drop` watching a
	 * `drag` session to hit-test zones). Keeps capabilities decoupled — `drag` never imports
	 * `drop`; `drop` opts into the stream. Fires after the owner's own start/move/end.
	 */
	observe?(session: InteractionSession, phase: 'start' | 'move' | 'end', reason?: EndReason): void;
}

export interface InteractionsOptions {
	/** Element to delegate the single document-level listeners on. Default: documentElement. */
	delegate?: () => HTMLElement;
	/** Install pointer + keyboard sensors automatically. Default: true. */
	defaultSensors?: boolean;
}
