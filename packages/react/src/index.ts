import { Draggable, type DragEventData, type DragOptions } from '@neodrag/core';
import type { Room } from '@neodrag/core/collab';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRoomBinding } from './_room-context.ts';

type RefCallback = (node: HTMLElement | null) => void;

/**
 * React wrapper for the v3 core — thin (~one hook per capability). The instance lives in a
 * ref; the latest options live in a ref so callbacks stay stable; each render pushes a
 * fine-grained `update()`. `isDragging`/`isOver` come back as state.
 *
 * **Collab:** pass an `id` (and a `room`, or mount a `<RoomProvider>`) and the draggable auto-joins
 * that room on mount and leaves on unmount — its committed position syncs as a `drag` op.
 */
type RegEntry = { priority: number; off: (() => void) | null };

export function useDraggable(options: DragOptions & { room?: Room } = {}): {
	ref: RefCallback;
	isDragging: boolean;
	handle: (opts?: { priority?: number }) => RefCallback;
	cancel: (opts?: { priority?: number }) => RefCallback;
} {
	const instance = useRef<Draggable | null>(null);
	const opts = useRef(options);
	opts.current = options;
	const [isDragging, set_dragging] = useState(false);
	const { join, leave } = useRoomBinding(options.room);
	// Handle/cancel registries (node → {priority, off}). `off` is null until the instance exists, so
	// a handle that mounts before this hook's element still registers once the instance is created.
	const handles = useRef(new Map<HTMLElement, RegEntry>());
	const cancels = useRef(new Map<HTMLElement, RegEntry>());

	const wrapped = useCallback(
		(): DragOptions => ({
			...opts.current,
			onDragStart: (e: DragEventData) => {
				set_dragging(true);
				opts.current.onDragStart?.(e);
			},
			onDrag: (e: DragEventData) => {
				// Two-way `position`: write the live offset back if the caller defined a setter.
				if (Object.getOwnPropertyDescriptor(opts.current, 'position')?.set) {
					opts.current.position = e.offset;
				}
				opts.current.onDrag?.(e);
			},
			onDragEnd: (e: DragEventData) => {
				set_dragging(false);
				opts.current.onDragEnd?.(e);
			},
		}),
		[],
	);

	const ref = useCallback<RefCallback>(
		(node) => {
			leave();
			if (instance.current) {
				for (const e of handles.current.values()) e.off = null;
				for (const e of cancels.current.values()) e.off = null;
				instance.current.destroy();
			}
			if (node) {
				const inst = (instance.current = new Draggable(node, wrapped()));
				join(inst, opts.current.id);
				// Flush handles/cancels registered before the instance existed.
				for (const [n, e] of handles.current) e.off = inst.registerHandle(n, { priority: e.priority });
				for (const [n, e] of cancels.current) e.off = inst.registerCancel(n, { priority: e.priority });
			} else {
				instance.current = null;
			}
		},
		[wrapped, join, leave],
	);

	// `handle`/`cancel` are stable; each returns a ref callback that tracks its own node (so React's
	// node-less `null` unmount call can still unregister the right one). A new callback per render is
	// a net no-op: the old one unregisters the node, the new one re-registers it.
	const marker = useCallback(
		(map: Map<HTMLElement, RegEntry>, is_handle: boolean, priority: number): RefCallback => {
			let node: HTMLElement | null = null;
			return (n) => {
				if (n) {
					node = n;
					const off = instance.current
						? is_handle
							? instance.current.registerHandle(n, { priority })
							: instance.current.registerCancel(n, { priority })
						: null;
					map.set(n, { priority, off });
				} else if (node) {
					map.get(node)?.off?.();
					map.delete(node);
					node = null;
				}
			};
		},
		[],
	);
	const handle = useCallback(
		(o?: { priority?: number }) => marker(handles.current, true, o?.priority ?? 0),
		[marker],
	);
	const cancel = useCallback(
		(o?: { priority?: number }) => marker(cancels.current, false, o?.priority ?? 0),
		[marker],
	);

	useEffect(() => {
		instance.current?.update(wrapped());
	});

	return { ref, isDragging, handle, cancel };
}

// The draggable option surface, for `useDraggable(opts)`. Other capabilities live at their own
// subpaths — `@neodrag/react/sortable`, `/resize`, `/rotate`, `/drop`, `/collab` — and the core
// `Interactions` engine at `@neodrag/core`. The root stays drag-only.
export type { DragOptions, DragEventData, Axis, BoundsInput, DragPlugin } from '@neodrag/core';

// Tier-2 `use: []` drag extensions — framework-agnostic, re-exported from core so they sit alongside
// the draggable (`import { useDraggable, magnetic } from '@neodrag/react'`). Tree-shaken away unless used.
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
