import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import type { CollabOp, CollabTarget, LocalPresence, PresenceFrame } from '../collab-types.ts';
import { Resize, type ResizeHandle, type ResizeOptions } from './resize.ts';

/** Ergonomic single-element resize: `new Resizable(node, options)`. Satisfies the unified
 *  {@link CollabTarget} seam, so `room.add(resizable)` works. */
export class Resizable implements CollabTarget {
	readonly #handle: ResizeHandle;

	constructor(node: DndNode, options: ResizeOptions = {}) {
		this.#handle = sharedCapability(Resize, () => new Resize()).bind(node, options);
	}

	update(options: Partial<ResizeOptions>): void {
		this.#handle.update(options);
	}

	get size(): { width: number; height: number } {
		return this.#handle.size;
	}

	// ── CollabTarget seam (delegates to the handle) ───────────────────────────
	get targetId(): string {
		return this.#handle.targetId;
	}
	get hasExplicitId(): boolean {
		return this.#handle.hasExplicitId;
	}
	onCommit(fn: (op: CollabOp) => void): () => void {
		return this.#handle.onCommit(fn);
	}
	onPresence(fn: (p: LocalPresence | null) => void): () => void {
		return this.#handle.onPresence(fn);
	}
	applyExternal(op: CollabOp): void {
		this.#handle.applyExternal(op);
	}
	showRemotePresence(frame: PresenceFrame): void {
		this.#handle.showRemotePresence(frame);
	}
	clearRemotePresence(peerId?: string): void {
		this.#handle.clearRemotePresence(peerId);
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
