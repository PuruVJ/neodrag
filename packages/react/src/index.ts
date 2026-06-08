import {
	Neodrag,
	type DragEventData,
	type DragPlugin,
	type DragPluginList,
	type DropPluginList,
	type ResizeApplier,
	type ResizePluginList,
} from '@neodrag/core';
import { eventPayload, hasReactiveSlots, programmaticToInput } from '@neodrag/core/internal';
import { defineDragPlugin } from '@neodrag/core/plugins';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
	NEODRAG_ATTACH_KEY,
	bindingProps,
	propsWithAttachment,
	targetSpreadProps,
	type NeodragElementProps,
} from './attachments.ts';
import { Draggable, type DraggableOptions } from './draggable.ts';
import { Droppable } from './drop/droppable.ts';
import { Resizable } from './resizable-binding.ts';
import { useDraggableBinding, useDroppableBinding, useResizableBinding } from './use-neodrag-binding.ts';

export type { DragEventData, DragPluginList, ResizeApplier, ResizePluginList };
export type { DraggableOptions } from './draggable.ts';
export { Neodrag } from '@neodrag/core';
export {
	NEODRAG_ATTACH_KEY,
	bindingProps,
	propsWithAttachment,
	targetSpreadProps,
	type NeodragElementProps,
	type DraggableTargetOptions,
	type DroppableZoneOptions,
	type ResizableFrameOptions,
} from './attachments.ts';
export { Draggable } from './draggable.ts';
export { Droppable } from './drop/droppable.ts';
export { Resizable } from './resizable-binding.ts';
export { createReactiveMarkup, ReactiveMarkupAdapter } from './markup.ts';
export {
	useDraggableBinding,
	useDroppableBinding,
	useResizableBinding,
	useNeodragBinding,
} from './use-neodrag-binding.ts';

export interface DragState extends DragEventData {
	isDragging: boolean;
}

const idleInput = programmaticToInput({ phase: 'end', clientX: 0, clientY: 0 });

const defaultState: DragState = {
	offset: { x: 0, y: 0 },
	offsetPx: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	visualNode: null as unknown as HTMLElement,
	input: idleInput,
	pointer: { x: 0, y: 0 },
	isDragging: false,
};

export type DragSyncMode = 'full' | 'start-end' | false;

const createSyncPlugin = (setState: Dispatch<SetStateAction<DragState>>, mode: DragSyncMode) =>
	defineDragPlugin(() => ({
		key: Symbol('neodrag.react-state-sync'),
		phase: 'post',
		skipOnCancel: true,

		start(ctx, _, input) {
			setState({ ...eventPayload(ctx, input), isDragging: true });
		},

		drag(ctx, _, input) {
			if (mode !== 'full') return;
			setState({ ...eventPayload(ctx, input), isDragging: true });
		},

		end(ctx, _, input) {
			setState({ ...eventPayload(ctx, input), isDragging: false });
		},
	}))();

function withSync(plugins: DragPluginList, sync: DragPlugin | null): DragPluginList {
	if (!sync) return plugins;
	return [...plugins, sync];
}

function isRefObject(value: unknown): value is RefObject<HTMLElement | SVGElement | null> {
	return (
		value !== null &&
		typeof value === 'object' &&
		'current' in value &&
		!Array.isArray(value)
	);
}

function isDraggableOptions(value: unknown): value is DraggableOptions {
	return value !== null && typeof value === 'object' && !Array.isArray(value) && !('current' in value);
}

type DraggableHookOptions = DraggableOptions & { syncState?: DragSyncMode };

function useDraggableFromOptions(options: DraggableHookOptions) {
	const { syncState: syncMode = false, ...draggableOptions } = options;
	const optionsRef = useRef(draggableOptions);
	optionsRef.current = draggableOptions;
	const syncRef = useRef<DragPlugin | null>(null);
	const dragRef = useRef<Draggable | null>(null);
	const [state, setState] = useState<DragState>(defaultState);

	if (!dragRef.current) {
		syncRef.current = syncMode ? createSyncPlugin(setState, syncMode) : null;
		const plugins = withSync(draggableOptions.plugins, syncRef.current);
		dragRef.current = new Draggable({ ...draggableOptions, plugins });
	}

	const drag = dragRef.current;

	useLayoutEffect(() => {
		const opts = optionsRef.current;
		const plugins = withSync(opts.plugins, syncRef.current);
		dragRef.current?.update(plugins);
	});

	const binding = useDraggableBinding(drag);

	return {
		...binding,
		state: syncMode ? state : { ...defaultState, isDragging: drag.isDragging },
		draggable: drag,
	};
}

function useDraggableLegacy(
	slots: DragPluginList,
	withState: boolean,
	syncMode: DragSyncMode,
	externalRef?: RefObject<HTMLElement | SVGElement | null>,
) {
	const [state, setState] = useState<DragState>(defaultState);
	const sync = useRef(withState && syncMode ? createSyncPlugin(setState, syncMode) : null);
	const dragRef = useRef<Draggable | null>(null);
	const slotsRef = useRef(slots);
	slotsRef.current = slots;

	const pluginList = withSync(slots, sync.current);

	if (!dragRef.current) {
		dragRef.current = new Draggable({ plugins: pluginList });
	}

	const drag = dragRef.current;
	const binding = useDraggableBinding(drag);

	const attachRef = useCallback((node: HTMLElement | SVGElement | null) => {
		const attach = dragRef.current?.target[NEODRAG_ATTACH_KEY] as
			| ((el: HTMLElement | SVGElement | null) => void | (() => void))
			| undefined;
		return attach?.(node);
	}, []);

	useLayoutEffect(() => {
		const list = withSync(slotsRef.current, sync.current);
		if (!hasReactiveSlots(list)) return;
		dragRef.current?.update(list);
	});

	useEffect(() => () => dragRef.current?.destroy(), []);

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
		spread: binding.spread,
		target: binding.target,
		isDragging: binding.isDragging,
		state: withState ? state : defaultState,
		draggable: drag,
	};
}

export function useDraggable(options: DraggableHookOptions): ReturnType<typeof useDraggableFromOptions>;

export function useDraggable(
	slots?: DragPluginList,
	options?: { syncState?: DragSyncMode },
): {
	ref: (node: HTMLElement | SVGElement | null) => void;
	spread: ReturnType<typeof targetSpreadProps>;
	target: NeodragElementProps;
	isDragging: boolean;
	state: DragState;
	draggable: Draggable;
};

export function useDraggable(
	ref: RefObject<HTMLElement | SVGElement | null>,
	slots?: DragPluginList,
	options?: { syncState?: DragSyncMode },
): DragState;

export function useDraggable(
	refOrOptionsOrSlots: RefObject<HTMLElement | SVGElement | null> | DraggableHookOptions | DragPluginList = [],
	maybeSlotsOrOptions?: DragPluginList | { syncState?: DragSyncMode },
	maybeOptions?: { syncState?: DragSyncMode },
) {
	if (isDraggableOptions(refOrOptionsOrSlots)) {
		return useDraggableFromOptions(refOrOptionsOrSlots);
	}

	const isRefForm = isRefObject(refOrOptionsOrSlots);

	const options = (isRefForm ? maybeOptions : maybeSlotsOrOptions) as
		| { syncState?: DragSyncMode }
		| undefined;
	const syncMode = options?.syncState ?? 'start-end';

	if (isRefForm) {
		const ref = refOrOptionsOrSlots;
		const slots = (maybeSlotsOrOptions as DragPluginList) ?? [];
		const { state } = useDraggableLegacy(slots, true, syncMode, ref);
		return state;
	}

	const slots = refOrOptionsOrSlots as DragPluginList;
	return useDraggableLegacy(slots, true, syncMode);
}

export function useDroppable(slots?: DropPluginList): ReturnType<typeof useDroppableFromPlugins>;

export function useDroppable(
	ref: RefObject<HTMLElement | SVGElement | null>,
	slots?: DropPluginList,
): void;

export function useDroppable(
	options: Omit<ConstructorParameters<typeof Droppable>[0], never>,
): ReturnType<typeof useDroppableFromOptions>;

function useDroppableFromOptions(
	options: ConstructorParameters<typeof Droppable>[0],
) {
	const dropRef = useRef<Droppable | null>(null);
	if (!dropRef.current) dropRef.current = new Droppable(options);
	return useDroppableBinding(dropRef.current);
}

function useDroppableFromPlugins(
	refOrSlots: RefObject<HTMLElement | SVGElement | null> | DropPluginList = [],
	maybeSlots: DropPluginList = [],
) {
	const isRefForm = isRefObject(refOrSlots);
	const slots = (isRefForm ? maybeSlots : refOrSlots) as DropPluginList;
	const externalRef = isRefForm ? refOrSlots : undefined;

	const dropRef = useRef<Droppable | null>(null);
	const slotsRef = useRef(slots);
	slotsRef.current = slots;

	if (!dropRef.current) {
		dropRef.current = new Droppable({ plugins: slots });
	}

	const binding = useDroppableBinding(dropRef.current);

	const attachRef = useCallback((node: HTMLElement | SVGElement | null) => {
		const attach = dropRef.current?.zone[NEODRAG_ATTACH_KEY] as
			| ((el: HTMLElement | SVGElement | null) => void | (() => void))
			| undefined;
		return attach?.(node);
	}, []);

	useLayoutEffect(() => {
		if (!hasReactiveSlots(slotsRef.current)) return;
		dropRef.current?.update(slotsRef.current);
	});

	useEffect(() => () => dropRef.current?.destroy(), []);

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
	return { ref: attachRef, spread: binding.spread, zone: binding.zone, droppable: dropRef.current };
}

export function useDroppable(
	refOrOptionsOrSlots: RefObject<HTMLElement | SVGElement | null> | DropPluginList | ConstructorParameters<typeof Droppable>[0] = [],
	maybeSlots: DropPluginList = [],
) {
	if (isDraggableOptions(refOrOptionsOrSlots) && 'plugins' in refOrOptionsOrSlots) {
		return useDroppableFromOptions(refOrOptionsOrSlots as ConstructorParameters<typeof Droppable>[0]);
	}
	return useDroppableFromPlugins(refOrOptionsOrSlots as RefObject<HTMLElement | SVGElement | null> | DropPluginList, maybeSlots);
}

export function useResizable(slots?: ResizePluginList): ReturnType<typeof useResizableFromPlugins>;

export function useResizable(
	ref: RefObject<HTMLElement | SVGElement | null>,
	slots?: ResizePluginList,
): void;

export function useResizable(
	options: ConstructorParameters<typeof Resizable>[0],
): ReturnType<typeof useResizableFromOptions>;

function useResizableFromOptions(options: ConstructorParameters<typeof Resizable>[0]) {
	const resizeRef = useRef<Resizable | null>(null);
	if (!resizeRef.current) resizeRef.current = new Resizable(options);
	return useResizableBinding(resizeRef.current);
}

function useResizableFromPlugins(
	refOrSlots: RefObject<HTMLElement | SVGElement | null> | ResizePluginList = [],
	maybeSlots: ResizePluginList = [],
) {
	const isRefForm = isRefObject(refOrSlots);
	const slots = (isRefForm ? maybeSlots : refOrSlots) as ResizePluginList;
	const externalRef = isRefForm ? refOrSlots : undefined;

	const resizeRef = useRef<Resizable | null>(null);
	const slotsRef = useRef(slots);
	slotsRef.current = slots;

	if (!resizeRef.current) {
		resizeRef.current = new Resizable({ plugins: slots });
	}

	const binding = useResizableBinding(resizeRef.current);

	const attachRef = useCallback((node: HTMLElement | SVGElement | null) => {
		const attach = resizeRef.current?.frame[NEODRAG_ATTACH_KEY] as
			| ((el: HTMLElement | SVGElement | null) => void | (() => void))
			| undefined;
		return attach?.(node);
	}, []);

	useLayoutEffect(() => {
		if (!hasReactiveSlots(slotsRef.current)) return;
		resizeRef.current?.update(slotsRef.current);
	});

	useEffect(() => () => resizeRef.current?.destroy(), []);

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
	return { ref: attachRef, spread: binding.spread, frame: binding.frame, resizable: resizeRef.current };
}

export function useResizable(
	refOrOptionsOrSlots: RefObject<HTMLElement | SVGElement | null> | ResizePluginList | ConstructorParameters<typeof Resizable>[0] = [],
	maybeSlots: ResizePluginList = [],
) {
	if (isDraggableOptions(refOrOptionsOrSlots) && 'plugins' in refOrOptionsOrSlots) {
		return useResizableFromOptions(refOrOptionsOrSlots as ConstructorParameters<typeof Resizable>[0]);
	}
	return useResizableFromPlugins(refOrOptionsOrSlots as RefObject<HTMLElement | SVGElement | null> | ResizePluginList, maybeSlots);
}
