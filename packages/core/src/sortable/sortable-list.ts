import { sharedCapability } from '../shared.ts';
import {
	Sortable,
	SORTABLE_KEY_ATTR,
	sortableKey,
	type MoveOp,
	type SortableHandle,
	type SortableOptions,
	type SortablePresence,
} from './sortable.ts';

/** The attribute binding produced by `SortableList.row(item)` — spread onto a row element. */
export type SortableRow = { readonly [SORTABLE_KEY_ATTR]: string };

/** Ergonomic per-container class: `new SortableList(container, options)`. */
export class SortableList<T = unknown> {
	readonly #handle: SortableHandle<T>;

	constructor(container: HTMLElement, options: SortableOptions<T>) {
		this.#handle = sharedCapability(Sortable, () => new Sortable()).bind(container, options);
	}

	/**
	 * The per-row binding — spread it onto each item element instead of hand-writing the
	 * `data-sortable-key` attribute: `<li {...list.row(item)}>`. Pass the ITEM; its key is derived
	 * via {@link sortableKey} (its `id`/`key`, or the item itself for primitives).
	 */
	row(item: T): SortableRow {
		return { [SORTABLE_KEY_ATTR]: sortableKey(item) } as SortableRow;
	}

	update(options: Partial<SortableOptions<T>>): void {
		this.#handle.update(options);
	}

	/**
	 * Apply a remote anchor move op (e.g. from a CRDT peer) through the same reorder path — the
	 * inbound half of the collab seam. See `bindCollab`.
	 */
	applyExternal(op: MoveOp): void {
		this.#handle.applyExternal(op);
	}

	/** Current in-flight reorder presence (drag key + from/to index), or null. */
	presence(): SortablePresence | null {
		return this.#handle.presence();
	}

	destroy(): void {
		this.#handle.destroy();
	}
}
