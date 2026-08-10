import { Draggable } from '../drag/draggable.ts';
import type { DragEventData, DragPlugin, Point } from '../drag/drag.ts';
import type { CollabOp, LocalPresence, PresenceFrame } from '../collab-types.ts';
import type { Room } from '../collab/index.ts';
import { autoId } from '../utils.ts';

/** Split direction: `'x'` lays panes out in a row (vertical gutters), `'y'` in a column. */
export type SplitAxis = 'x' | 'y';

export interface SplitPaneOptions {
	/** `'x'` (row, default) or `'y'` (column). */
	axis?: SplitAxis;
	/** Initial pane weights (relative `flex-grow`). Defaults to equal weights as panes register. */
	sizes?: number[];
	/** Minimum weight per pane — a single value for all, or one per pane. Default `0`. */
	minSizes?: number | number[];
	/** Stable string id — the `target` in the unified collab op grammar. Required in practice for
	 * collab (it must match across peers); an auto id is peer-local. */
	id?: string;
	/** Fires once per gesture, on release, with the settled weights. */
	onResize?: (sizes: number[]) => void;
	/** Fires on every change (each move + programmatic set) — the live-binding seam. */
	onChange?: (sizes: number[]) => void;
	/** Pure op stream — `{ type: 'splitpane', target, sizes }` once per gesture that changes the
	 * layout, on release. The last-write-wins seam `@neodrag/collab` subscribes to. */
	onCommit?: (op: CollabOp) => void;
}

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Framework-agnostic split-pane math. Holds the pane weights and redistributes a conserved budget
 * between two neighbours when a gutter is dragged — one grows by exactly what the other loses,
 * each clamped to its minimum. The DOM (applying `flex` to panes, making gutters draggable) is the
 * wrapper's job; this class never touches it.
 */
export class SplitPaneController {
	readonly axis: SplitAxis;
	sizes: number[];
	#min: number[];
	#start: number[] | null = null;
	#dragging = false;
	readonly #on_resize?: (s: number[]) => void;
	readonly #on_change?: (s: number[]) => void;
	// ── collab seam ───────────────────────────────────────────────────────────
	#id?: string;
	readonly #auto_target_id = autoId('splitpane');
	readonly #on_commit?: (op: CollabOp) => void;
	readonly #commit_subscribers = new Set<(op: CollabOp) => void>();
	readonly #presence_subscribers = new Set<(p: LocalPresence | null) => void>();

	constructor(options: SplitPaneOptions = {}) {
		this.axis = options.axis ?? 'x';
		this.sizes = options.sizes ? options.sizes.slice() : [];
		this.#min = this.#resolve_min(options.minSizes, this.sizes.length);
		this.#id = options.id;
		this.#on_resize = options.onResize;
		this.#on_change = options.onChange;
		this.#on_commit = options.onCommit;
	}

	/** The split's stable string id — the `target` in the unified op grammar. */
	get targetId(): string {
		return this.#id ?? this.#auto_target_id;
	}
	get hasExplicitId(): boolean {
		return this.#id != null;
	}

	#resolve_min(min: number | number[] | undefined, n: number): number[] {
		if (min == null) return Array.from({ length: n }, () => 0);
		if (typeof min === 'number') return Array.from({ length: n }, () => min);
		return min.slice();
	}

	/** Grow the tracked pane count to at least `n`, seeding new panes with weight `1`. */
	ensureCount(n: number): void {
		while (this.sizes.length < n) this.sizes.push(1);
		while (this.#min.length < n) this.#min.push(0);
	}

	/** Replace all weights (programmatic / controlled set). */
	setSizes(sizes: number[]): void {
		this.sizes = sizes.slice();
		this.#on_change?.(this.sizes);
	}

	/** Snapshot the weights at gesture start so the move is computed from a stable base. */
	beginGutter(): void {
		this.#start = this.sizes.slice();
		this.#dragging = true;
	}

	/**
	 * Move `deltaPx` of the container's main axis from the pane after the gutter to the pane before
	 * it (clamped so neither drops below its minimum). `containerPx` converts px → weight.
	 */
	dragGutter(index: number, deltaPx: number, containerPx: number): void {
		const s = this.#start;
		if (!s || containerPx <= 0 || index < 0 || index + 1 >= s.length) return;
		const total = s.reduce((a, b) => a + b, 0);
		const pair = s[index]! + s[index + 1]!;
		const d = (deltaPx / containerPx) * total;
		const a = clamp(s[index]! + d, this.#min[index] ?? 0, pair - (this.#min[index + 1] ?? 0));
		const next = s.slice();
		next[index] = a;
		next[index + 1] = pair - a;
		this.sizes = next;
		this.#on_change?.(this.sizes);
		this.#pump_presence();
	}

	/** End the gesture; emit the settled weights and (if changed) a commit op. */
	endGutter(): void {
		const start = this.#start;
		this.#start = null;
		this.#dragging = false;
		this.#on_resize?.(this.sizes);
		const changed = !start || start.length !== this.sizes.length || start.some((v, i) => v !== this.sizes[i]);
		if (changed) this.#emit_commit({ type: 'splitpane', target: this.targetId, sizes: this.sizes.slice() });
		for (const fn of this.#presence_subscribers) fn(null);
	}

	// ── CollabTarget seam ──────────────────────────────────────────────────────
	/** The Room only ever passes `{ id }`. */
	update(options: { id?: string }): void {
		if (options.id !== undefined) this.#id = options.id;
	}
	onCommit(fn: (op: CollabOp) => void): () => void {
		this.#commit_subscribers.add(fn);
		return () => this.#commit_subscribers.delete(fn);
	}
	onPresence(fn: (p: LocalPresence | null) => void): () => void {
		this.#presence_subscribers.add(fn);
		return () => this.#presence_subscribers.delete(fn);
	}
	/** Apply a remote split-pane fact — set the layout. A no-op while a local gesture owns it (the
	 * local commit wins, last-write-wins). Foreign kinds ignored. */
	applyExternal(op: CollabOp): void {
		if (op.type !== 'splitpane' || this.#dragging) return;
		this.setSizes(op.sizes);
	}
	/** Render a remote peer's in-flight drag — set the live layout (no-op during a local gesture). */
	showRemotePresence(frame: PresenceFrame): void {
		if (frame.type !== 'splitpane' || this.#dragging) return;
		this.setSizes(frame.sizes);
	}
	// The committed op (or the last presence frame) is authoritative — nothing to roll back.
	clearRemotePresence(): void {}

	#emit_commit(op: CollabOp): void {
		this.#on_commit?.(op);
		for (const fn of this.#commit_subscribers) fn(op);
	}

	#pump_presence(): void {
		if (this.#presence_subscribers.size === 0) return;
		const frame: LocalPresence = { type: 'splitpane', target: this.targetId, sizes: this.sizes.slice() };
		for (const fn of this.#presence_subscribers) fn(frame);
	}
}

/**
 * Drag plugin for the gutter between pane `index` and `index + 1`. It reads the gutter's drag offset
 * (a `Draggable` on that axis), maps it to a neighbour-pair resize, and returns `{ x: 0, y: 0 }` so
 * the gutter itself never translates — the flex layout repositions it as the panes change. Spread
 * the gutter element with a `Draggable({ axis, use: [splitGutter(...)] })`.
 */
export function splitGutter(
	controller: SplitPaneController,
	index: number,
	containerPx: () => number,
): DragPlugin {
	return {
		name: 'split-gutter',
		onStart: () => controller.beginGutter(),
		onMove: ({ offset }: DragEventData): Point => {
			const delta = controller.axis === 'x' ? offset.x : offset.y;
			controller.dragGutter(index, delta, containerPx());
			return { x: 0, y: 0 };
		},
		onEnd: () => controller.endGutter(),
	};
}

/**
 * Framework-agnostic, DOM-aware split-pane binder. Register the wrapper with `container(el)`, each
 * pane with `pane(el, i)`, and each divider with `gutter(el, i)` (between pane `i` and `i + 1`) — each
 * returns a disposer, so elements bind independently and in any order. The container becomes a flex
 * row/column, panes carry the live `flex` weight, and a gutter is a one-axis `Draggable` running the
 * `splitGutter` plugin. Read live weights from `sizes`. Framework wrappers map the register methods to
 * refs/attachments and mirror `onChange`; vanilla uses it directly. Pass a `room` to sync the layout.
 */
export class SplitPane {
	readonly axis: SplitAxis;
	readonly #ctrl: SplitPaneController;
	readonly #room?: Room;
	readonly #id?: string;
	readonly #on_change?: (sizes: number[]) => void;
	#container: HTMLElement | null = null;
	#room_off: (() => void) | null = null;
	readonly #panes = new Map<number, HTMLElement>();

	constructor(options: SplitPaneOptions & { room?: Room } = {}) {
		this.axis = options.axis ?? 'x';
		this.#room = options.room;
		this.#id = options.id;
		this.#on_change = options.onChange;
		this.#ctrl = new SplitPaneController({
			...options,
			onChange: () => this.#emit(),
			onResize: options.onResize,
		});
	}

	/** Live pane weights (the controller's array — copy before mutating). */
	get sizes(): number[] {
		return this.#ctrl.sizes;
	}
	/** Programmatically set the weights (e.g. a reset or a preset layout). */
	setSizes(sizes: number[]): void {
		this.#ctrl.setSizes(sizes);
	}

	/** Register the container element. Returns a disposer. */
	container(el: HTMLElement): () => void {
		this.#container = el;
		el.style.display = 'flex';
		el.style.flexDirection = this.axis === 'x' ? 'row' : 'column';
		if (this.#room) this.#room_off = this.#room.add(this.#ctrl, this.#id);
		return () => {
			this.#room_off?.();
			this.#room_off = null;
			if (this.#container === el) this.#container = null;
		};
	}

	/** Register pane `index`. Returns a disposer. */
	pane(el: HTMLElement, index: number): () => void {
		this.#panes.set(index, el);
		const grew = index + 1 > this.#ctrl.sizes.length;
		this.#ctrl.ensureCount(index + 1);
		el.style.overflow = 'hidden';
		el.style.minWidth = '0';
		el.style.minHeight = '0';
		// Only notify when a genuinely new pane grew the weight array — re-binding an existing pane
		// (e.g. a framework re-render) must not re-emit, or a sizes→render→re-bind loop forms.
		if (grew) this.#emit();
		else this.#apply_panes();
		return () => {
			if (this.#panes.get(index) === el) this.#panes.delete(index);
		};
	}

	/** Register the gutter between pane `index` and `index + 1`. Returns a disposer. */
	gutter(el: HTMLElement, index: number): () => void {
		const inst = new Draggable(el, {
			axis: this.axis,
			use: [splitGutter(this.#ctrl, index, () => this.#container_px())],
		});
		return () => inst.destroy();
	}

	#container_px(): number {
		if (!this.#container) return 0;
		const r = this.#container.getBoundingClientRect();
		return this.axis === 'x' ? r.width : r.height;
	}
	#apply_panes(): void {
		for (const [i, el] of this.#panes) el.style.flex = `${this.#ctrl.sizes[i] ?? 1} 1 0`;
	}
	#emit(): void {
		this.#apply_panes();
		this.#on_change?.(this.#ctrl.sizes);
	}
}
