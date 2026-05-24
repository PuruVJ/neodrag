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
import type { Accessor } from 'solid-js';
import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';

export type { DragPluginList };
export { Neodrag, CoreDraggable as Draggable };

export interface DragState extends DragEventData {
	isDragging: boolean;
}

const defaultDragState: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	visualNode: null as unknown as HTMLElement,
	isDragging: false,
	event: null as unknown as PointerEvent,
};

const createSyncPlugin = (setState: (state: DragState) => void) =>
	defineDragPlugin(() => ({
		key: Symbol('neodrag.solid-state-sync'),
		name: 'solid-state-sync',
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

export function useDraggable(slots: DragPluginList = []): [typeof defaultDragState, (node: HTMLElement | SVGElement | null) => void];

export function useDraggable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	slots: DragPluginList,
): [typeof defaultDragState];

export function useDraggable(
	elementOrSlots: Accessor<HTMLElement | SVGElement | null | undefined> | DragPluginList = [],
	maybeSlots: DragPluginList = [],
) {
	const isElementForm = typeof elementOrSlots === 'function';

	const [dragState, setDragState] = createSignal<DragState>(defaultDragState);
	const sync = createSyncPlugin(setDragState);

	const slots = (): DragPluginList =>
		isElementForm ? maybeSlots : (elementOrSlots as DragPluginList);

	const binding = new CoreDraggable({
		plugins: untrack(() => withSync(slots(), sync)),
	});

	const attachRef = (node: HTMLElement | SVGElement | null) => {
		if (!node) {
			binding.detach();
			return;
		}
		binding.attach(node);
	};

	if (isElementForm) {
		const element = elementOrSlots as Accessor<HTMLElement | SVGElement | null | undefined>;

		createEffect(() => {
			const node = element();
			if (!node) {
				binding.detach();
				return;
			}
			untrack(() => binding.attach(node));
			onCleanup(() => binding.detach());
		});

		createEffect(() => {
			const list = withSync(slots(), sync);
			if (!hasReactiveSlots(list)) return;
			binding.update(list);
		});

		onCleanup(() => binding.destroy());
		return [dragState];
	}

	createEffect(() => {
		const list = withSync(slots(), sync);
		if (!hasReactiveSlots(list)) return;
		binding.update(list);
	});

	onCleanup(() => binding.destroy());

	return [dragState, attachRef] as const;
}

export function useDroppable(slots: DropPluginList = []): [
	undefined,
	(node: HTMLElement | SVGElement | null) => void,
];

export function useDroppable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	slots: DropPluginList,
): [undefined];

export function useDroppable(
	elementOrSlots: Accessor<HTMLElement | SVGElement | null | undefined> | DropPluginList = [],
	maybeSlots: DropPluginList = [],
) {
	const isElementForm = typeof elementOrSlots === 'function';
	const slots = (): DropPluginList =>
		isElementForm ? maybeSlots : (elementOrSlots as DropPluginList);

	const binding = new DroppableBinding({ plugins: untrack(() => slots()) });

	const attachRef = (node: HTMLElement | SVGElement | null) => {
		if (!node) {
			binding.detach();
			return;
		}
		binding.attach(node);
	};

	if (isElementForm) {
		const element = elementOrSlots as Accessor<HTMLElement | SVGElement | null | undefined>;

		createEffect(() => {
			const node = element();
			if (!node) {
				binding.detach();
				return;
			}
			untrack(() => binding.attach(node));
			onCleanup(() => binding.detach());
		});

		createEffect(() => {
			if (!hasReactiveSlots(slots())) return;
			binding.update(slots());
		});

		onCleanup(() => binding.destroy());
		return [undefined];
	}

	createEffect(() => {
		if (!hasReactiveSlots(slots())) return;
		binding.update(slots());
	});

	onCleanup(() => binding.destroy());

	return [undefined, attachRef] as const;
}
