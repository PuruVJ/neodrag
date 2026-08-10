/**
 * The unified collab grammar — three nouns, one seam, identical for every interaction:
 *
 * 1. **Target** — anything synced has a stable string `id` option (a draggable box, a resizable
 *    panel, a sortable list). The id must match on every collaborating peer.
 * 2. **Op** — a serializable past-tense fact emitted on commit, `{ type, target, …payload }`.
 *    Sequence ops (`move`/`transfer`) are anchor-based and rebase under concurrency; value ops
 *    (`drag`/`resize`) are last-write-wins registers. All idempotent to re-apply.
 * 3. **Presence** — an ephemeral present-tense frame, same envelope, `null` on end.
 *
 * `Drop` is deliberately outside the op model: a drop's outcome is app side-effects, not replayable
 * state (it does carry remote-hover *presence*, though). New capabilities join by adding one op +
 * one presence variant and implementing {@link CollabTarget} — `rotate` did exactly that.
 */

/**
 * Committed sortable reorder — an anchor-based **sequence** op. `move` reorders within one list;
 * `transfer` moves an item from list `from` into `target`. Anchor-based (`afterId`, `null` = front)
 * so concurrent inserts/deletes rebase cleanly. The capability's internal ops (which carry item
 * objects + indices) are adapted to/from this serializable wire shape by the handle.
 */
export type SortableOp =
	| { type: 'move'; target: string; itemId: string; afterId: string | null }
	| { type: 'transfer'; target: string; from: string; itemId: string; afterId: string | null };

/** Committed drag position — a last-write-wins value op. */
export type DragOp = { type: 'drag'; target: string; x: number; y: number };
/**
 * Committed size — a last-write-wins value op. A west/north-edge resize also shifts the element's
 * position to pin the far edge, so the op optionally carries `left`/`top` (HTML px, or SVG x/y);
 * east/south resizes omit them. Optional ⇒ backward-compatible with peers that only sync size.
 */
export type ResizeOp = {
	type: 'resize';
	target: string;
	width: number;
	height: number;
	left?: number;
	top?: number;
};

/** Committed rotation angle (degrees) — a last-write-wins value op. The pivot is local config, so
 *  only the angle rides the wire. */
export type RotateOp = { type: 'rotate'; target: string; angle: number };

/** Committed split-pane layout — a last-write-wins value op carrying the pane weights. The whole
 *  split is one target; the value is the `sizes` array. */
export type SplitPaneOp = { type: 'splitpane'; target: string; sizes: number[] };

/** Committed pan/zoom viewport transform — a last-write-wins value op. A shared canvas: the whole
 *  viewport is one target, the value is its `{ x, y, scale }` (world translate in px + scale). */
export type PanZoomOp = { type: 'panzoom'; target: string; x: number; y: number; scale: number };

export type CollabOp = SortableOp | DragOp | ResizeOp | RotateOp | SplitPaneOp | PanZoomOp;

/** In-flight presence as emitted locally (the Room stamps `peerId` on the wire). */
export type LocalPresence =
	| {
			type: 'sortable';
			/** The hovered list (gap opens here). */
			target: string;
			/** The list the drag started in. */
			fromTarget: string;
			itemId: string;
			insertIndex: number;
			rel: { x: number; y: number } | null;
	  }
	| { type: 'drag'; target: string; x: number; y: number }
	| { type: 'resize'; target: string; width: number; height: number; left?: number; top?: number }
	| { type: 'rotate'; target: string; angle: number }
	| { type: 'splitpane'; target: string; sizes: number[] }
	| { type: 'panzoom'; target: string; x: number; y: number; scale: number }
	| {
			/** A remote peer hovering a drop zone ("about to drop here"). Pure presence — there is no
			 *  `drop` op (a drop's outcome is an app side-effect, not replayable state). */
			type: 'drop-hover';
			/** The hovered zone's id. */
			target: string;
			/** The peer's cursor in viewport coords. */
			x: number;
			y: number;
			/** Best-effort identity of what's being dragged (e.g. a `data-neodrag-sortable-key`), for a label. */
			itemId?: string;
	  };

/** A presence frame on the wire / arriving from a remote peer. */
export type PresenceFrame = LocalPresence & { peerId: string };

/**
 * Where to render the floating clone of a remote sortable drag. `false`/`true` = off / on (on mounts
 * the clone on `document.body`, viewport-anchored); an `HTMLElement` mounts it *inside* that element
 * so it inherits that subtree's scoped styles. See `RoomOptions.mirror`.
 */
export type Mirror = boolean | HTMLElement;

/**
 * The one structural seam every syncable capability instance exposes (SortableList/SortableHandle
 * today; Draggable/Resizable next). `@neodrag/collab`'s Room consumes exactly this — any object
 * satisfying it can join a room.
 */
export interface CollabTarget {
	readonly targetId: string;
	/** Whether `targetId` came from an explicit `id` option. Auto ids are peer-local — they will
	 * never match across clients, so the Room warns when an id-less target joins. */
	readonly hasExplicitId: boolean;
	/** The Room only ever passes `{ id }`; implementations accept their full (wider) option bags. */
	update(options: { id?: string }): void;
	/** Subscribe to committed ops — additive, never clobbers the user's own callbacks. */
	onCommit(fn: (op: CollabOp) => void): () => void;
	/** Subscribe to in-flight presence (`null` = gesture ended). */
	onPresence(fn: (p: LocalPresence | null) => void): () => void;
	/** Apply a remote fact through the same paths a local commit uses. Foreign kinds no-op. */
	applyExternal(op: CollabOp): void;
	/** Render a remote peer's in-flight gesture. Foreign kinds no-op. */
	showRemotePresence(frame: PresenceFrame, opts?: { mirror?: Mirror }): void;
	clearRemotePresence(peerId?: string, opts?: { ease?: boolean }): void;
	/** Sortable lists only: the current key order — the Room seeds its reconciler from it. A reactive
	 *  wrapper may return `undefined` until its node attaches (the Room re-seeds on first gesture). */
	keys?(): string[] | undefined;
}
