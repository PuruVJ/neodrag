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

const engine = Neodrag.shared;

export type { DragPluginList };
export { Neodrag, CoreDraggable as Draggable };

export interface DragState extends DragEventData {
	isDragging: boolean;
}

const defaultState: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	visualNode: null as unknown as HTMLElement,
	isDragging: false,
	event: null as unknown as PointerEvent,
};

const createSyncPlugin = (setState: React.Dispatch<React.SetStateAction<DragState>>) =>
	defineDragPlugin(() => ({
		key: Symbol('neodrag.react-state-sync'),
		name: 'react-state-sync',
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

function withSync(plugins: DragPluginList, sync: DragPlugin): DragPluginList {
	return [...plugins, sync];
}

type UseDraggableSlots = DragPluginList;

function useDraggableBinding(
	slots: UseDraggableSlots,
	withState: boolean,
	externalRef?: React.RefObject<HTMLElement | SVGElement | null>,
) {
	const [state, setState] = useState<DragState>(defaultState);
	const sync = useRef(createSyncPlugin(setState));
	const bindingRef = useRef<CoreDraggable | null>(null);
	const slotsRef = useRef(slots);
	slotsRef.current = slots;

	const pluginList = withState ? withSync(slots, sync.current) : slots;
	const reactive = hasReactiveSlots(pluginList);

	if (!bindingRef.current) {
		bindingRef.current = new CoreDraggable({ plugins: pluginList });
	}

	const attachRef = useCallback(
		(node: HTMLElement | SVGElement | null) => {
			const binding = bindingRef.current;
			if (!binding) return;

			if (!node) {
				binding.detach();
				return;
			}

			binding.attach(node);
		},
		[],
	);

	useLayoutEffect(() => {
		const binding = bindingRef.current;
		if (!binding) return;
		const list = withState ? withSync(slotsRef.current, sync.current) : slotsRef.current;
		if (!hasReactiveSlots(list)) return;
		binding.update(list);
	});

	useEffect(() => {
		return () => bindingRef.current?.destroy();
	}, []);

	useEffect(() => {
		if (!externalRef) return;
		attachRef(externalRef.current);
	}, [externalRef, attachRef]);

	return {
		ref: attachRef,
		state: withState ? state : defaultState,
		reactive,
	};
}

export function useDraggable(slots: UseDraggableSlots = []): {
	ref: (node: HTMLElement | SVGElement | null) => void;
	state: DragState;
};

export function useDraggable(
	ref: React.RefObject<HTMLElement | SVGElement | null>,
	slots?: UseDraggableSlots,
): DragState;

export function useDraggable(
	refOrSlots: React.RefObject<HTMLElement | SVGElement | null> | UseDraggableSlots = [],
	maybeSlots: UseDraggableSlots = [],
) {
	const isRefForm =
		refOrSlots !== null &&
		typeof refOrSlots === 'object' &&
		'current' in refOrSlots &&
		!Array.isArray(refOrSlots);

	if (isRefForm) {
		const ref = refOrSlots as React.RefObject<HTMLElement | SVGElement | null>;
		const { state } = useDraggableBinding(maybeSlots, true, ref);
		return state;
	}

	const { ref, state } = useDraggableBinding(refOrSlots as UseDraggableSlots, true);
	return { ref, state };
}

export function useDroppable(slots: DropPluginList = []): {
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

	useEffect(() => {
		if (!externalRef) return;
		attachRef(externalRef.current);
	}, [externalRef, attachRef]);

	if (isRefForm) return;
	return { ref: attachRef };
}
