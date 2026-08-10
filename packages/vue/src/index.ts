import { Draggable, type DragEventData, type DragOptions } from '@neodrag/core';
import type { Room } from '@neodrag/core/collab';
import { onScopeDispose, ref, watch, watchEffect, type Ref } from 'vue';
import { useRoomBinding } from './_room-context.ts';

// Each composable re-reads its options through `build()` inside a `watchEffect`, so reactive
// option values passed as getters (e.g. `useDraggable({ get axis() { return axis.value } })`) are
// tracked and pushed to the live instance via `.update()` — no recreation. `build()` is evaluated
// unconditionally so its reactive reads are tracked even before the node binds.

/**
 * Vue v3 — composables returning a template `ref` + reactive state. Bind via `:ref`.
 *
 * **Collab:** pass an `id` (and a `room`, or call `provideRoom()` in an ancestor) and the draggable
 * auto-joins that room on mount and leaves on unmount — its committed position syncs as a `drag` op.
 */
type RegEntry = { priority: number; off: (() => void) | null };
type FnRef = (el: HTMLElement | null) => void;

export function useDraggable(options: DragOptions & { room?: Room } = {}): {
	ref: Ref<HTMLElement | null>;
	isDragging: Ref<boolean>;
	handle: (opts?: { priority?: number }) => FnRef;
	cancel: (opts?: { priority?: number }) => FnRef;
} {
	const target = ref<HTMLElement | null>(null);
	const isDragging = ref(false);
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
			isDragging.value = true;
			options.onDragStart?.(e);
		},
		onDrag: (e: DragEventData) => {
			if (position_two_way) options.position = e.offset;
			options.onDrag?.(e);
		},
		onDragEnd: (e: DragEventData) => {
			isDragging.value = false;
			options.onDragEnd?.(e);
		},
	});

	watch(target, (node) => {
		leave();
		if (inst) {
			for (const e of handles.values()) e.off = null;
			for (const e of cancels.values()) e.off = null;
			inst.destroy();
		}
		if (node) {
			inst = new Draggable(node, build());
			join(inst, options.id);
			for (const [n, e] of handles) e.off = inst.registerHandle(n, { priority: e.priority });
			for (const [n, e] of cancels) e.off = inst.registerCancel(n, { priority: e.priority });
		} else {
			inst = null;
		}
	});
	watchEffect(() => {
		const next = build();
		inst?.update(next);
	});
	onScopeDispose(() => inst?.destroy());

	// `handle`/`cancel` return function refs (`:ref="drag.handle()"`); each tracks its own node so
	// Vue's node-less `null` unmount call unregisters the right one.
	const marker = (map: Map<HTMLElement, RegEntry>, is_handle: boolean, priority: number): FnRef => {
		let node: HTMLElement | null = null;
		return (el) => {
			if (el) {
				node = el;
				const off = inst
					? is_handle
						? inst.registerHandle(el, { priority })
						: inst.registerCancel(el, { priority })
					: null;
				map.set(el, { priority, off });
			} else if (node) {
				map.get(node)?.off?.();
				map.delete(node);
				node = null;
			}
		};
	};
	const handle = (o?: { priority?: number }) => marker(handles, true, o?.priority ?? 0);
	const cancel = (o?: { priority?: number }) => marker(cancels, false, o?.priority ?? 0);

	return { ref: target, isDragging, handle, cancel };
}

// The draggable option surface, for `useDraggable(opts)`. Other capabilities live at their own
// subpaths — `@neodrag/vue/sortable`, `/resize`, `/rotate`, `/drop`, `/collab` — and the core
// `Interactions` engine at `@neodrag/core`. The root stays drag-only.
export type { DragOptions, DragEventData, Axis, BoundsInput, DragPlugin } from '@neodrag/core';

// Tier-2 `use: []` drag extensions — framework-agnostic, re-exported from core so they sit alongside
// the draggable (`import { useDraggable, magnetic } from '@neodrag/vue'`). Tree-shaken away unless used.
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
