import { Draggable, type DragEventData, type DragOptions } from '@neodrag/core';
import type { Room } from '@neodrag/core/collab';
import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';
import { useRoomBinding } from './_room-context.ts';

type Ref = (node: HTMLElement) => void;
type RegEntry = { priority: number; off: (() => void) | null };

// Each primitive re-reads its options through `build()` inside a `createEffect`, so reactive
// option values passed as getters (e.g. `createDraggable({ get axis() { return axis(); } })`) are
// tracked and pushed to the live instance via `.update()` — no recreation. `build()` is evaluated
// unconditionally before the `inst?.update` guard so its signals are tracked even before bind.

/**
 * Solid v3 — `create*` primitives returning a `ref` setter + reactive state accessors.
 *
 * **Collab:** pass an `id` (and a `room`, or mount a `<RoomProvider>`) and the draggable auto-joins
 * that room on mount and leaves on unmount — its committed position syncs as a `drag` op.
 */
export function createDraggable(options: DragOptions & { room?: Room } = {}): {
	ref: Ref;
	isDragging: Accessor<boolean>;
	handle: (opts?: { priority?: number }) => Ref;
	cancel: (opts?: { priority?: number }) => Ref;
} {
	const [isDragging, set_dragging] = createSignal(false);
	let inst: Draggable | null = null;
	const { join, leave } = useRoomBinding(options.room);
	// Handle/cancel registries — `off` is null until the instance exists (a handle can mount first).
	const handles = new Map<HTMLElement, RegEntry>();
	const cancels = new Map<HTMLElement, RegEntry>();
	// Two-way `position`: a `set position(v)` accessor gets the live offset written back each move.
	const position_two_way = Boolean(Object.getOwnPropertyDescriptor(options, 'position')?.set);
	const build = (): DragOptions => ({
		...options,
		onDragStart: (e: DragEventData) => {
			set_dragging(true);
			options.onDragStart?.(e);
		},
		onDrag: (e: DragEventData) => {
			if (position_two_way) options.position = e.offset;
			options.onDrag?.(e);
		},
		onDragEnd: (e: DragEventData) => {
			set_dragging(false);
			options.onDragEnd?.(e);
		},
	});
	const ref: Ref = (node) => {
		leave();
		inst?.destroy();
		inst = new Draggable(node, build());
		join(inst, options.id);
		// Flush handles/cancels registered before the instance existed.
		for (const [n, e] of handles) e.off = inst.registerHandle(n, { priority: e.priority });
		for (const [n, e] of cancels) e.off = inst.registerCancel(n, { priority: e.priority });
		onCleanup(() => {
			leave();
			for (const e of handles.values()) e.off = null;
			for (const e of cancels.values()) e.off = null;
			inst?.destroy();
			inst = null;
		});
	};
	createEffect(() => {
		const next = build();
		inst?.update(next);
	});

	// `handle`/`cancel` return ref setters; Solid fires them once and tears down via `onCleanup`, so
	// no null-call churn. Buffered until the instance exists.
	const marker = (map: Map<HTMLElement, RegEntry>, is_handle: boolean, priority: number): Ref => {
		return (node) => {
			const off = inst
				? is_handle
					? inst.registerHandle(node, { priority })
					: inst.registerCancel(node, { priority })
				: null;
			const entry: RegEntry = { priority, off };
			map.set(node, entry);
			onCleanup(() => {
				entry.off?.();
				map.delete(node);
			});
		};
	};
	const handle = (o?: { priority?: number }) => marker(handles, true, o?.priority ?? 0);
	const cancel = (o?: { priority?: number }) => marker(cancels, false, o?.priority ?? 0);

	return { ref, isDragging, handle, cancel };
}

// The draggable option surface, for `createDraggable(opts)`. Other capabilities live at their own
// subpaths — `@neodrag/solid/sortable`, `/resize`, `/rotate`, `/drop`, `/collab` — and the core
// `Interactions` engine at `@neodrag/core`. The root stays drag-only.
export type { DragOptions, DragEventData, Axis, BoundsInput, DragPlugin } from '@neodrag/core';

// Tier-2 `use: []` drag extensions — framework-agnostic, re-exported from core so they sit alongside
// the draggable (`import { createDraggable, magnetic } from '@neodrag/solid'`). Tree-shaken away unless used.
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
