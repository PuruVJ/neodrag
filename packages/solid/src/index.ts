import {
	Neodrag,
	Compartment,
	defineDragPlugin,
	resolveDragPlugins,
	type DragEventData,
	type DragPluginInput,
} from '@neodrag/core';
import type { Accessor } from 'solid-js';
import { createEffect, createRenderEffect, createSignal, untrack } from 'solid-js';

const engine = Neodrag.shared;

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

function withSync(plugins: DragPluginInput, sync: ReturnType<typeof createSyncPlugin>): DragPluginInput {
	if (typeof plugins === 'function') {
		return () => [...resolveDragPlugins(plugins()), sync];
	}
	return [...plugins, sync];
}

export function useDraggable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	plugins: Accessor<DragPluginInput> = () => [],
) {
	const [dragState, setDragState] = createSignal<DragState>(defaultDragState);
	const sync = createSyncPlugin(setDragState);

	createEffect(() => {
		const node = element();
		if (!node) return;

		const input = untrack(() => withSync(plugins(), sync));
		const handle = engine.draggable(node, input);
		return () => handle.destroy();
	});

	return dragState;
}

export function createCompartment(reactive: ConstructorParameters<typeof Compartment>[0]) {
	const compartment = new Compartment(reactive);

	createRenderEffect(() => {
		compartment.current = reactive?.();
	});

	return compartment;
}

export * from '@neodrag/core/plugins';
export { Compartment, Neodrag };
