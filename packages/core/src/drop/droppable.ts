import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import type { CollabOp, CollabTarget, LocalPresence, PresenceFrame } from '../collab-types.ts';
import { Drop, type DropHandle, type DropOptions } from './drop.ts';
import { enableNativeDnd } from './native-drag.ts';

/**
 * Ergonomic single-element drop zone: `new Droppable(node, options)`. Shares the engine
 * with `Draggable`, so it automatically observes drag sessions. Satisfies the unified
 * {@link CollabTarget} seam (drop carries remote-hover presence, no replayable op), so
 * `room.add(droppable)` works.
 */
export class Droppable implements CollabTarget {
	readonly #handle: DropHandle;

	constructor(node: DndNode, options: DropOptions = {}) {
		if (options.native) enableNativeDnd(); // arm the OS file/text DnD sensor + session host
		this.#handle = sharedCapability(Drop, () => new Drop()).bind(node, options);
	}

	update(options: Partial<DropOptions>): void {
		this.#handle.update(options);
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
