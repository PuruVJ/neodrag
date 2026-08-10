import { sharedCapability } from '../shared.ts';
import type { DndNode } from '../types.ts';
import type { CollabOp, CollabTarget, LocalPresence, PresenceFrame } from '../collab-types.ts';
import { Drag, type DragHandle, type DragOptions, type Point } from './drag.ts';

/**
 * Ergonomic single-element class API: `new Draggable(node, options)`. Routes through the
 * shared engine + `Drag` capability so importing only `Draggable` pulls in just the drag
 * path (no drop/resize/sortable). Satisfies the unified {@link CollabTarget} seam, so
 * `room.add(draggable)` works.
 */
export class Draggable implements CollabTarget {
	readonly #handle: DragHandle;

	constructor(node: DndNode, options: DragOptions = {}) {
		this.#handle = sharedCapability(Drag, () => new Drag()).bind(node, options);
	}

	/** Targeted, fine-grained update — only the provided keys are written. */
	update(options: Partial<DragOptions>): void {
		this.#handle.update(options);
	}

	get offset(): Point {
		return this.#handle.offset;
	}

	get isDragging(): boolean {
		return this.#handle.isDragging;
	}

	/** Register a descendant as a drag **handle** — once any exist, a drag may start only from inside
	 * one. `priority` overrides the innermost-wins nesting cascade. Returns an idempotent disposer. */
	registerHandle(node: DndNode, opts?: { priority?: number }): () => void {
		return this.#handle.registerHandle(node, opts);
	}

	/** Register a descendant as a **cancel** zone — a drag may never start from inside it. Returns an
	 * idempotent disposer. */
	registerCancel(node: DndNode, opts?: { priority?: number }): () => void {
		return this.#handle.registerCancel(node, opts);
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
