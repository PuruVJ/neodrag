import {
	Draggable as CoreDraggable,
	Droppable,
	Resizable as CoreResizable,
	Neodrag,
	type DragEventData,
	type DragPlugin,
	type DragPluginList,
	type DropPluginList,
	type ResizePluginList,
} from '@neodrag/core';
import { eventPayload, hasReactiveSlots, programmaticToInput } from '@neodrag/core/internal';
import { defineDragPlugin } from '@neodrag/core/plugins';
import type { Accessor } from 'solid-js';
import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';

export type { DragEventData, DragPluginList, ResizePluginList };
export { Neodrag, CoreDraggable as Draggable, CoreResizable as Resizable };

export type DragSyncMode = 'full' | 'start-end' | false;

export interface DragState extends DragEventData {
	isDragging: boolean;
}

const idleInput = programmaticToInput({ phase: 'end', clientX: 0, clientY: 0 });

const defaultDragState: DragState = {
	offset: { x: 0, y: 0 },
	offsetPx: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	visualNode: null as unknown as HTMLElement,
	input: idleInput,
	pointer: { x: 0, y: 0 },
	isDragging: false,
};

const createSyncPlugin = (setState: (state: DragState) => void, mode: DragSyncMode) =>
	defineDragPlugin(() => ({
		key: Symbol('neodrag.solid-state-sync'),
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

function withSync(plugins: DragPluginList, sync: DragPlugin): DragPluginList {
	return [...plugins, sync];
}

export function createDraggable(
	slots?: DragPluginList,
	options?: { syncState?: DragSyncMode },
): [Accessor<DragState>, (node: HTMLElement | SVGElement | null) => void];

export function createDraggable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	slots: DragPluginList,
	options?: { syncState?: DragSyncMode },
): [Accessor<DragState>];

export function createDraggable(
	elementOrSlots: Accessor<HTMLElement | SVGElement | null | undefined> | DragPluginList = [],
	maybeSlotsOrOptions?: DragPluginList | { syncState?: DragSyncMode },
	maybeOptions?: { syncState?: DragSyncMode },
) {
	const isElementForm = typeof elementOrSlots === 'function';
	const options = (isElementForm ? maybeOptions : maybeSlotsOrOptions) as
		| { syncState?: DragSyncMode }
		| undefined;
	const syncMode: DragSyncMode = options?.syncState ?? 'start-end';

	const [dragState, setDragState] = createSignal<DragState>(defaultDragState);
	const sync = createSyncPlugin(setDragState, syncMode);

	const slots = (): DragPluginList =>
		isElementForm ? (maybeSlotsOrOptions as DragPluginList) : (elementOrSlots as DragPluginList);

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

export function createDroppable(
	slots?: DropPluginList,
): [undefined, (node: HTMLElement | SVGElement | null) => void];

export function createDroppable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	slots: DropPluginList,
): [undefined];

export function createDroppable(
	elementOrSlots: Accessor<HTMLElement | SVGElement | null | undefined> | DropPluginList = [],
	maybeSlots: DropPluginList = [],
) {
	const isElementForm = typeof elementOrSlots === 'function';
	const slots = (): DropPluginList =>
		isElementForm ? maybeSlots : (elementOrSlots as DropPluginList);

	const binding = new Droppable({ plugins: untrack(() => slots()) });

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

export function createResizable(
	slots?: ResizePluginList,
): [undefined, (node: HTMLElement | SVGElement | null) => void];

export function createResizable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	slots: ResizePluginList,
): [undefined];

export function createResizable(
	elementOrSlots: Accessor<HTMLElement | SVGElement | null | undefined> | ResizePluginList = [],
	maybeSlots: ResizePluginList = [],
) {
	const isElementForm = typeof elementOrSlots === 'function';
	const slots = (): ResizePluginList =>
		isElementForm ? maybeSlots : (elementOrSlots as ResizePluginList);

	const binding = new CoreResizable({ plugins: untrack(() => slots()) });

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
