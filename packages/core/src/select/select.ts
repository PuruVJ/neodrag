import { Draggable } from '../drag/draggable.ts';
import { marqueeSelect } from '../extend/marquee.ts';

export interface SelectableOptions<V = string> {
	/** Fires whenever the marquee selection changes, with the current selected values. */
	onSelect?: (selected: V[]) => void;
	/** Draw the marquee rectangle. Default `true`. Style via `--neodrag-marquee-fill` / `-stroke`. */
	box?: boolean;
}

export interface SelectBindOptions<V = string> extends SelectableOptions<V> {
	/** Fires on every selection change — the reactive-mirror seam for framework wrappers. */
	onChange?: (selected: V[]) => void;
}

/**
 * Framework-agnostic, DOM-aware rubber-band multi-select, built on the engine: the region is a
 * `Draggable` running the `marqueeSelect` plugin (so it gets the same pointer-capture, sensors and
 * text-selection suppression every gesture does), and it never translates. Register the region with
 * `container(el)` and each selectable child with `item(value, el)` (each returns a disposer). Selected
 * items get a `data-neodrag-selected` attribute to style; read the live set from `selected`. Framework
 * wrappers map the register methods to refs/attachments and mirror `onChange`; vanilla uses it directly.
 */
export class Selectable<V = string> {
	readonly #on_select?: (s: V[]) => void;
	readonly #on_change?: (s: V[]) => void;
	readonly #box: boolean;
	readonly #selected = new Set<V>();
	readonly #items = new Map<V, HTMLElement>();
	readonly #value_of = new WeakMap<Element, V>();
	#drag: Draggable | null = null;

	constructor(options: SelectBindOptions<V> = {}) {
		this.#on_select = options.onSelect;
		this.#on_change = options.onChange;
		this.#box = options.box ?? true;
	}

	/** The live set of selected values. */
	get selected(): Set<V> {
		return this.#selected;
	}

	/** Clear the selection programmatically. */
	clear(): void {
		this.#commit(new Set());
	}

	/** Register the selectable region. Returns a disposer. */
	container(el: HTMLElement): () => void {
		this.#drag = new Draggable(el, {
			use: [marqueeSelect(() => [...this.#items.values()], (els) => this.#apply(els), { box: this.#box })],
		});
		return () => {
			this.#drag?.destroy();
			this.#drag = null;
		};
	}

	/** Register a selectable child for `value`. Returns a disposer. */
	item(value: V, el: HTMLElement): () => void {
		this.#items.set(value, el);
		this.#value_of.set(el, value);
		if (this.#selected.has(value)) el.setAttribute('data-neodrag-selected', '');
		return () => {
			if (this.#items.get(value) === el) {
				this.#items.delete(value);
				this.#value_of.delete(el);
			}
		};
	}

	#apply(els: Element[]): void {
		const next = new Set<V>();
		for (const el of els) {
			const v = this.#value_of.get(el);
			if (v !== undefined) next.add(v);
		}
		this.#commit(next);
	}

	#commit(next: Set<V>): void {
		for (const v of this.#selected) {
			if (!next.has(v)) {
				this.#selected.delete(v);
				this.#items.get(v)?.removeAttribute('data-neodrag-selected');
			}
		}
		for (const v of next) {
			if (!this.#selected.has(v)) {
				this.#selected.add(v);
				this.#items.get(v)?.setAttribute('data-neodrag-selected', '');
			}
		}
		const list = [...this.#selected];
		this.#on_change?.(list);
		this.#on_select?.(list);
	}
}

export { rectsOverlap, type MarqueeOptions } from '../extend/marquee.ts';
