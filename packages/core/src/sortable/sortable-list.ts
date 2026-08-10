import { sharedCapability } from '../shared.ts';
import type {
	CollabOp,
	CollabTarget,
	LocalPresence,
	Mirror,
	PresenceFrame,
} from '../collab-types.ts';
import {
	Sortable,
	SORTABLE_KEY_ATTR,
	sortableKey,
	type SortableHandle,
	type SortableOptions,
	type SortablePresence,
} from './sortable.ts';

/** The attribute binding produced by `SortableList.row(item)` — spread onto a row element. */
export type SortableRow = { readonly [SORTABLE_KEY_ATTR]: string };

/** Ergonomic per-container class: `new SortableList(container, options)`. Satisfies the unified
 *  {@link CollabTarget} seam, so `room.add(list)` works. */
export class SortableList<T = unknown> implements CollabTarget {
	readonly #handle: SortableHandle<T>;

	constructor(container: HTMLElement, options: SortableOptions<T>) {
		this.#handle = sharedCapability(Sortable, () => new Sortable()).bind(container, options);
	}

	/**
	 * The per-row binding — spread it onto each item element instead of hand-writing the
	 * `data-neodrag-sortable-key` attribute: `<li {...list.row(item)}>`. Pass the ITEM; its key is derived
	 * via {@link sortableKey} (its `id`/`key`, or the item itself for primitives).
	 */
	row(item: T): SortableRow {
		return { [SORTABLE_KEY_ATTR]: sortableKey(item) } as SortableRow;
	}

	/**
	 * Imperatively register a row element under a stable string key — stamps the sortable-key
	 * attribute and returns a teardown that removes it. For framework wrappers whose row binding is
	 * an attachment/directive (`{...list.row(id)}`) rather than a static attribute.
	 */
	registerRow(node: HTMLElement, key: string): () => void {
		node.setAttribute(SORTABLE_KEY_ATTR, key);
		return () => node.removeAttribute(SORTABLE_KEY_ATTR);
	}

	update(options: Partial<SortableOptions<T>>): void {
		this.#handle.update(options);
	}

	/** Current in-flight reorder presence (drag key + from/to index), or null. */
	presence(): SortablePresence | null {
		return this.#handle.presence();
	}

	// ── CollabTarget seam (delegates to the handle) ───────────────────────────
	get targetId(): string {
		return this.#handle.targetId;
	}
	get hasExplicitId(): boolean {
		return this.#handle.hasExplicitId;
	}
	/** Current key order — the Room seeds its reconciler from this. */
	keys(): string[] {
		return this.#handle.keys();
	}
	onCommit(fn: (op: CollabOp) => void): () => void {
		return this.#handle.onCommit(fn);
	}
	onPresence(fn: (p: LocalPresence | null) => void): () => void {
		return this.#handle.onPresence(fn);
	}
	/** Apply a remote reorder/transfer fact through the same reorder path a local commit uses. */
	applyExternal(op: CollabOp): void {
		this.#handle.applyExternal(op);
	}
	showRemotePresence(frame: PresenceFrame, opts?: { mirror?: Mirror }): void {
		this.#handle.showRemotePresence(frame, opts);
	}
	clearRemotePresence(peer_id?: string, opts?: { ease?: boolean }): void {
		this.#handle.clearRemotePresence(peer_id, opts);
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
