import {
	Neodrag,
	defineDragPlugin,
	type DragEventData,
	type DragPlugin,
	type DragPluginInput,
} from '@neodrag/core';
import type { Accessor } from 'solid-js';
import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';

const engine = Neodrag.shared;

export type ReactiveDragPluginInput = DragPluginInput | (() => DragPluginInput);

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

function resolvePlugins(plugins: ReactiveDragPluginInput): DragPluginInput {
	return typeof plugins === 'function' ? plugins() : plugins;
}

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

function withSync(plugins: ReactiveDragPluginInput, sync: DragPlugin): DragPluginInput {
	return [...resolvePlugins(plugins), sync];
}

export function useDraggable(
	element: Accessor<HTMLElement | SVGElement | null | undefined>,
	plugins: Accessor<ReactiveDragPluginInput> = () => [],
) {
	const [dragState, setDragState] = createSignal<DragState>(defaultDragState);
	const sync = createSyncPlugin(setDragState);

	let handle: ReturnType<typeof engine.draggable> | undefined;

	createEffect(() => {
		const node = element();
		if (!node) {
			handle = undefined;
			return;
		}

		handle = engine.draggable(node, untrack(() => withSync(plugins(), sync)));

		onCleanup(() => {
			handle?.destroy();
			handle = undefined;
		});
	});

	createEffect(() => {
		if (!handle) return;
		handle.update(withSync(plugins(), sync));
	});

	return dragState;
}

export * from '@neodrag/core/plugins';
export { Neodrag };
