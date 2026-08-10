import { untrack } from 'svelte';
import { createAttachmentKey, type Attachment } from 'svelte/attachments';
import {
	Draggable as CoreDraggable,
	type DragEventData,
	type DragOptions,
	type DndNode,
} from '@neodrag/core';
import type { Room } from '@neodrag/core/collab';

type AttachProps = { [key: symbol]: Attachment<DndNode> };
/** A buffered handle/cancel registration: `off` is null until the draggable instance exists. */
type RegEntry = { priority: number; off: (() => void) | null };

/**
 * Class-based, reactive Svelte 5 wrapper around the core `Draggable`. Spread `{...drag.attach}`
 * on the element; read `drag.isDragging`. Pass reactive options as getters — `new Draggable({ get
 * axis() { return axis; } })` — and they update live.
 *
 * Reactivity model: the attachment runs inside an effect, so the initial instance is created with
 * options read **untracked** (otherwise an option change would re-run the attachment and recreate
 * the instance). A separate `$effect` tracks the option getters and pushes `update()`.
 *
 * **Collab:** pass an `id` and a `room`; the draggable auto-joins that room on mount and leaves on
 * unmount — its committed position syncs as a `drag` op. The other capabilities live at their own
 * subpaths — `@neodrag/svelte/sortable`, `/resize`, `/rotate`, `/drop`, `/collab`.
 */
export class Draggable {
	#is_dragging = $state(false);
	#offset = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	#instance: CoreDraggable | null = null;
	#room_off: (() => void) | null = null;
	readonly #room: Room | undefined;
	readonly attach: AttachProps;
	// Handle/cancel registrations, keyed by node, plus per-priority attachment caches so a repeated
	// `{...drag.handle()}` returns a stable attachment (no re-registration churn on re-render) and one
	// attachment can serve several handle elements.
	readonly #handles = new Map<DndNode, RegEntry>();
	readonly #cancels = new Map<DndNode, RegEntry>();
	readonly #handle_cache = new Map<number, AttachProps>();
	readonly #cancel_cache = new Map<number, AttachProps>();

	constructor(options: DragOptions & { room?: Room } = {}) {
		this.#room = options.room;
		// Two-way `position`: if the caller defined a setter (`set position(v)`), write the live
		// offset back to it each move. The spread below drops the accessor, so we write to the
		// original `options` object, which still owns the setter. Getter-only stays one-way.
		const position_two_way = Boolean(Object.getOwnPropertyDescriptor(options, 'position')?.set);
		const build = (): DragOptions => ({
			...options,
			onDragStart: (e: DragEventData) => {
				this.#is_dragging = true;
				this.#offset = e.offset;
				options.onDragStart?.(e);
			},
			onDrag: (e: DragEventData) => {
				this.#offset = e.offset;
				if (position_two_way) options.position = e.offset;
				options.onDrag?.(e);
			},
			onDragEnd: (e: DragEventData) => {
				this.#is_dragging = false;
				this.#offset = e.offset;
				options.onDragEnd?.(e);
			},
		});

		this.attach = {
			[createAttachmentKey()]: (node: DndNode) => {
				const inst = (this.#instance = new CoreDraggable(node, untrack(build)));
				if (this.#room) this.#room_off = this.#room.add(inst, options.id);
				// Flush handles/cancels that registered before the instance existed (a handle is a
				// descendant and can mount before this root attach runs).
				for (const [n, e] of this.#handles) e.off = inst.registerHandle(n, { priority: e.priority });
				for (const [n, e] of this.#cancels) e.off = inst.registerCancel(n, { priority: e.priority });
				return () => {
					this.#room_off?.();
					this.#room_off = null;
					for (const e of this.#handles.values()) e.off = null;
					for (const e of this.#cancels.values()) e.off = null;
					this.#instance?.destroy();
					this.#instance = null;
				};
			},
		};

		$effect(() => {
			const next = build();
			this.#instance?.update(next);
		});
	}

	get isDragging(): boolean {
		return this.#is_dragging;
	}

	/** Live drag offset (px) — reactive, updated each move. Starts at the origin. */
	get offset(): { x: number; y: number } {
		return this.#offset;
	}

	/** Spread onto a descendant to make it a drag **handle** — once any handle exists, a drag may
	 * start only from inside one. `priority` overrides the innermost-wins nesting cascade. */
	handle(opts?: { priority?: number }): AttachProps {
		return this.#marker(this.#handles, this.#handle_cache, true, opts?.priority ?? 0);
	}

	/** Spread onto a descendant to make it a **cancel** zone — a drag may never start from inside it. */
	cancel(opts?: { priority?: number }): AttachProps {
		return this.#marker(this.#cancels, this.#cancel_cache, false, opts?.priority ?? 0);
	}

	#marker(
		map: Map<DndNode, RegEntry>,
		cache: Map<number, AttachProps>,
		is_handle: boolean,
		priority: number,
	): AttachProps {
		let attach = cache.get(priority);
		if (!attach) {
			attach = {
				[createAttachmentKey()]: (node: DndNode) => {
					const off = this.#instance
						? is_handle
							? this.#instance.registerHandle(node, { priority })
							: this.#instance.registerCancel(node, { priority })
						: null;
					const entry: RegEntry = { priority, off };
					map.set(node, entry);
					return () => {
						entry.off?.();
						map.delete(node);
					};
				},
			};
			cache.set(priority, attach);
		}
		return attach;
	}
}

// The draggable option surface, for `new Draggable(opts)`. Other capabilities live at their own
// subpaths — `@neodrag/svelte/sortable`, `/resize`, `/rotate`, `/drop`, `/collab` — and the core
// `Interactions` engine at `@neodrag/core`. The root stays drag-only.
export type { DragOptions, DragEventData, Axis, BoundsInput, DragPlugin } from '@neodrag/core';

// Tier-2 `use: []` drag extensions — framework-agnostic, re-exported from core so they sit alongside
// the draggable (`import { Draggable, magnetic } from '@neodrag/svelte'`). Tree-shaken away unless used.
export {
	autoScroll,
	scrollLock,
	ghost,
	haptics,
	ariaDrag,
	snapGuides,
	marqueeSelect,
	magnetic,
	onMove,
	type AutoScrollOptions,
	type ScrollLockOptions,
	type GhostOptions,
	type AriaDragOptions,
	type AriaDragAnnounce,
	type SnapGuidesOptions,
	type MarqueeOptions,
	type MagneticOptions,
	type MagneticSpring,
} from '@neodrag/core';
