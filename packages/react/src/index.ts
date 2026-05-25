import {
	Draggable as CoreDraggable,
	DroppableBinding,
	Neodrag,
	hasReactiveSlots,
	type DragEventData,
	type DragPlugin,
	type DragPluginList,
	type DropPluginList,
} from '@neodrag/core';
import { defineDragPlugin } from '@neodrag/core/plugins';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type { DragEventData, DragPluginList };
export { Neodrag, CoreDraggable as Draggable };

export interface DragState extends DragEventData {
	isDragging: boolean;
}

export type DragSyncMode = 'full' | 'start-end' | false;

const defaultState: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	visualNode: null as unknown as HTMLElement,
	isDragging: false,
	event: null as unknown as PointerEvent,
};

const createSyncPlugin = (
	setState: React.Dispatch<React.SetStateAction<DragState>>,
	mode: DragSyncMode,
) =>
	defineDragPlugin(() => ({
		key: Symbol('neodrag.react-state-sync'),
		phase: 'post',
		skipOnCancel: true,

		start(ctx, _, event) {
			setState({
				offset: { x: ctx.offset.x, y: ctx.offset.y },
				rootNode: ctx.rootNode,
				visualNode: ctx.session.visual.node,
				isDragging: true,
				event,
			});
		},

		drag(ctx, _, event) {
			if (mode !== 'full') return;
			setState({
				offset: { x: ctx.offset.x, y: ctx.offset.y },
				rootNode: ctx.rootNode,
				visualNode: ctx.session.visual.node,
				isDragging: true,
				event,
			});
		},

		end(ctx, _, event) {
			setState({
				offset: { x: ctx.offset.x, y: ctx.offset.y },
				rootNode: ctx.rootNode,
				visualNode: ctx.session.visual.node,
				isDragging: false,
				event,
			});
		},
	}))();

function withSync(plugins: DragPluginList, sync: DragPlugin | null): DragPluginList {
	if (!sync) return plugins;
	return [...plugins, sync];
}

type UseDraggableSlots = DragPluginList;

function useDraggableBinding(
	slots: UseDraggableSlots,
	withState: boolean,
	syncMode: DragSyncMode,
	externalRef?: React.RefObject<HTMLElement | SVGElement | null>,
) {
	const [state, setState] = useState<DragState>(defaultState);
	const sync = useRef(withState && syncMode ? createSyncPlugin(setState, syncMode) : null);
	const bindingRef = useRef<CoreDraggable | null>(null);
	const slotsRef = useRef(slots);
	slotsRef.current = slots;

	const pluginList = withSync(slots, sync.current);

	if (!bindingRef.current) {
		bindingRef.current = new CoreDraggable({ plugins: pluginList });
	}

	const attachRef = useCallback((node: HTMLElement | SVGElement | null) => {
		const binding = bindingRef.current;
		if (!binding) return;
		if (!node) {
			binding.detach();
			return;
		}
		binding.attach(node);
	}, []);

	useLayoutEffect(() => {
		const binding = bindingRef.current;
		if (!binding) return;
		const list = withSync(slotsRef.current, sync.current);
		if (!hasReactiveSlots(list)) return;
		binding.update(list);
	});

	useEffect(() => () => bindingRef.current?.destroy(), []);

	useLayoutEffect(() => {
		if (!externalRef) return;
		attachRef(externalRef.current);
	});

	useEffect(() => {
		if (!externalRef) return;
		let cancelled = false;
		const tryAttach = () => {
			if (cancelled) return;
			if (externalRef.current) {
				attachRef(externalRef.current);
				return;
			}
			requestAnimationFrame(tryAttach);
		};
		tryAttach();
		return () => {
			cancelled = true;
			attachRef(null);
		};
	}, [externalRef, attachRef]);

	return {
		ref: attachRef,
		state: withState ? state : defaultState,
	};
}

export function useDraggable(
	slots?: UseDraggableSlots,
	options?: { syncState?: DragSyncMode },
): {
	ref: (node: HTMLElement | SVGElement | null) => void;
	state: DragState;
};

export function useDraggable(
	ref: React.RefObject<HTMLElement | SVGElement | null>,
	slots?: UseDraggableSlots,
	options?: { syncState?: DragSyncMode },
): DragState;

export function useDraggable(
	refOrSlots: React.RefObject<HTMLElement | SVGElement | null> | UseDraggableSlots = [],
	maybeSlotsOrOptions?: UseDraggableSlots | { syncState?: DragSyncMode },
	maybeOptions?: { syncState?: DragSyncMode },
) {
	const isRefForm =
		refOrSlots !== null &&
		typeof refOrSlots === 'object' &&
		'current' in refOrSlots &&
		!Array.isArray(refOrSlots);

	const options = (
		isRefForm ? maybeOptions : maybeSlotsOrOptions
	) as { syncState?: DragSyncMode } | undefined;
	const syncMode = options?.syncState ?? 'start-end';

	if (isRefForm) {
		const ref = refOrSlots as React.RefObject<HTMLElement | SVGElement | null>;
		const slots = (maybeSlotsOrOptions as UseDraggableSlots) ?? [];
		const { state } = useDraggableBinding(slots, true, syncMode, ref);
		return state;
	}

	const slots = refOrSlots as UseDraggableSlots;
	const { ref, state } = useDraggableBinding(slots, true, syncMode);
	return { ref, state };
}

export function useDroppable(slots?: DropPluginList): {
	ref: (node: HTMLElement | SVGElement | null) => void;
};

export function useDroppable(
	ref: React.RefObject<HTMLElement | SVGElement | null>,
	slots?: DropPluginList,
): void;

export function useDroppable(
	refOrSlots: React.RefObject<HTMLElement | SVGElement | null> | DropPluginList = [],
	maybeSlots: DropPluginList = [],
) {
	const isRefForm =
		refOrSlots !== null &&
		typeof refOrSlots === 'object' &&
		'current' in refOrSlots &&
		!Array.isArray(refOrSlots);

	const slots = (isRefForm ? maybeSlots : refOrSlots) as DropPluginList;
	const externalRef = isRefForm
		? (refOrSlots as React.RefObject<HTMLElement | SVGElement | null>)
		: undefined;

	const bindingRef = useRef<DroppableBinding | null>(null);
	const slotsRef = useRef(slots);
	slotsRef.current = slots;

	if (!bindingRef.current) {
		bindingRef.current = new DroppableBinding({ plugins: slots });
	}

	const attachRef = useCallback((node: HTMLElement | SVGElement | null) => {
		const binding = bindingRef.current;
		if (!binding) return;
		if (!node) {
			binding.detach();
			return;
		}
		binding.attach(node);
	}, []);

	useLayoutEffect(() => {
		if (!hasReactiveSlots(slotsRef.current)) return;
		bindingRef.current?.update(slotsRef.current);
	});

	useEffect(() => () => bindingRef.current?.destroy(), []);

	useLayoutEffect(() => {
		if (!externalRef) return;
		attachRef(externalRef.current);
	});

	useEffect(() => {
		if (!externalRef) return;
		let cancelled = false;
		const tryAttach = () => {
			if (cancelled) return;
			if (externalRef.current) {
				attachRef(externalRef.current);
				return;
			}
			requestAnimationFrame(tryAttach);
		};
		tryAttach();
		return () => {
			cancelled = true;
			attachRef(null);
		};
	}, [externalRef, attachRef]);

	if (isRefForm) return;
	return { ref: attachRef };
}
