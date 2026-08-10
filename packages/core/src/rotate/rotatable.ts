import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import type { CollabOp, CollabTarget, LocalPresence, PresenceFrame } from '../collab-types.ts';
import { Rotate, type RotateHandle, type RotateOptions } from './rotate.ts';

/** Ergonomic single-element rotate: `new Rotatable(node, options)`. Satisfies the unified
 * {@link CollabTarget} seam, so `room.add(rotatable)` works. */
export class Rotatable implements CollabTarget {
	readonly #handle: RotateHandle;

	constructor(node: DndNode, options: RotateOptions = {}) {
		this.#handle = sharedCapability(Rotate, () => new Rotate()).bind(node, options);
	}

	/** Targeted, fine-grained update — only the provided keys are written. */
	update(options: Partial<RotateOptions>): void {
		this.#handle.update(options);
	}

	/** The current angle in degrees. */
	get angle(): number {
		return this.#handle.angle;
	}

	/** The rotatable's stable string id — the `target` in the unified collab op grammar. */
	get targetId(): string {
		return this.#handle.targetId;
	}

	/** Whether `targetId` came from an explicit `id` option (auto ids are peer-local). */
	get hasExplicitId(): boolean {
		return this.#handle.hasExplicitId;
	}

	/** Subscribe to committed ops (additive — composes with `options.onCommit`). */
	onCommit(fn: (op: CollabOp) => void): () => void {
		return this.#handle.onCommit(fn);
	}

	/** Subscribe to in-flight presence (`null` = rotate ended). */
	onPresence(fn: (p: LocalPresence | null) => void): () => void {
		return this.#handle.onPresence(fn);
	}

	/** Apply a remote rotate fact — spins the node to the committed angle (eased). Foreign kinds ignored. */
	applyExternal(op: CollabOp): void {
		this.#handle.applyExternal(op);
	}

	/** Render a remote peer's in-flight rotation over this node (live eased angle). */
	showRemotePresence(frame: PresenceFrame): void {
		this.#handle.showRemotePresence(frame);
	}

	/** Clear a peer's remote presence, easing back to the committed angle. */
	clearRemotePresence(peerId?: string): void {
		this.#handle.clearRemotePresence(peerId);
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
