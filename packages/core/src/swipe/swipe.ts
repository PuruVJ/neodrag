import { Draggable } from '../drag/draggable.ts';
import type { DragEventData } from '../drag/drag.ts';

export type SwipeAxis = 'x' | 'y';
export type SwipeResult = { dismissed: true; direction: -1 | 1 } | { dismissed: false };

/**
 * Decide a swipe's outcome from the released offset (px) and the element's size along the axis.
 * `threshold` is a fraction of the size when `<= 1`, otherwise an absolute px distance. Pure.
 */
export function resolveSwipe(offset: number, size: number, threshold = 0.4): SwipeResult {
	const limit = threshold <= 1 ? threshold * size : threshold;
	if (limit > 0 && Math.abs(offset) >= limit) return { dismissed: true, direction: offset < 0 ? -1 : 1 };
	return { dismissed: false };
}

export interface SwipeState {
	offset: { x: number; y: number };
	dismissed: boolean;
}

export interface SwipeOptions {
	/** Swipe axis. Default `'x'`. */
	axis?: SwipeAxis;
	/** Dismiss distance — a fraction of the element's size when `<= 1` (default `0.4`), else px. */
	threshold?: number;
	/** Animation duration (ms) for the settle (spring-back or fly-out). Default `220`. */
	duration?: number;
	/** Fires after the element flies out past the threshold. `direction` is `-1` (left/up) or `1`. */
	onDismiss?: (direction: -1 | 1) => void;
}

export interface SwipeBindOptions extends SwipeOptions {
	/** Fires on every offset/dismissed change — the reactive-mirror seam for framework wrappers. */
	onChange?: (state: SwipeState) => void;
}

/**
 * Framework-agnostic, DOM-aware swipe-to-dismiss binder, built on the core `Draggable`: the element
 * follows the pointer on one axis; released past `threshold` it flies out and fires `onDismiss`,
 * otherwise it springs back. Register the element with `attach(el)` (returns a disposer); read live
 * `offset` / `isDismissed`. Framework wrappers map `attach` to a ref/attachment and mirror `onChange`;
 * vanilla uses it directly.
 */
export class Swipeable {
	readonly axis: SwipeAxis;
	readonly #threshold: number;
	readonly #duration: number;
	readonly #on_dismiss?: (d: -1 | 1) => void;
	readonly #on_change?: (s: SwipeState) => void;
	#offset: { x: number; y: number } = { x: 0, y: 0 };
	#dismissed = false;
	#node: HTMLElement | null = null;
	#drag: Draggable | null = null;

	constructor(options: SwipeBindOptions = {}) {
		this.axis = options.axis ?? 'x';
		this.#threshold = options.threshold ?? 0.4;
		this.#duration = options.duration ?? 220;
		this.#on_dismiss = options.onDismiss;
		this.#on_change = options.onChange;
	}

	/** Live offset (px). */
	get offset(): { x: number; y: number } {
		return this.#offset;
	}
	/** True once the element has been swiped out. */
	get isDismissed(): boolean {
		return this.#dismissed;
	}

	/** Register the swipeable element. Returns a disposer. */
	attach(el: HTMLElement): () => void {
		this.#node = el;
		this.#drag = new Draggable(el, {
			axis: this.axis,
			onDragStart: () => {
				el.style.transition = ''; // track the pointer instantly
			},
			onDrag: (e: DragEventData) => {
				this.#offset = e.offset;
				this.#emit();
			},
			onDragEnd: (e: DragEventData) => this.#settle(e.offset),
		});
		return () => {
			this.#drag?.destroy();
			this.#drag = null;
			this.#node = null;
		};
	}

	/** Spring the element back to rest and clear the dismissed flag (e.g. to re-show it). */
	reset(): void {
		this.#dismissed = false;
		this.#animate_to({ x: 0, y: 0 });
	}

	#emit(): void {
		this.#on_change?.({ offset: this.#offset, dismissed: this.#dismissed });
	}

	#animate_to(target: { x: number; y: number }): void {
		if (!this.#node || !this.#drag) return;
		this.#node.style.transition = `translate ${this.#duration}ms ease, opacity ${this.#duration}ms ease`;
		this.#offset = target;
		this.#drag.update({ position: target });
		this.#emit();
	}

	#settle(offset: { x: number; y: number }): void {
		if (!this.#node) return;
		const size = this.axis === 'x' ? this.#node.offsetWidth : this.#node.offsetHeight;
		const dist = this.axis === 'x' ? offset.x : offset.y;
		const res = resolveSwipe(dist, size, this.#threshold);
		if (res.dismissed) {
			const fly = res.direction * (size + 48);
			this.#dismissed = true;
			if (this.#node) this.#node.style.opacity = '0';
			this.#animate_to(this.axis === 'x' ? { x: fly, y: 0 } : { x: 0, y: fly });
			setTimeout(() => this.#on_dismiss?.(res.direction), this.#duration);
		} else {
			this.#animate_to({ x: 0, y: 0 }); // spring back
		}
	}
}
