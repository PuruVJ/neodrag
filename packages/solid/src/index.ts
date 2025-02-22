import { createDraggable } from '@neodrag/core';
import { DragEventData, unstable_definePlugin, type Plugin } from '@neodrag/core/plugins';
import type { Accessor, Setter } from 'solid-js';
import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';

const draggable_factory = createDraggable();

interface DragState extends DragEventData {
	isDragging: boolean;
}

const default_drag_state: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	currentNode: null as unknown as HTMLElement,
	isDragging: false,
};

// Create the state sync plugin with the provided setter function
const state_sync = unstable_definePlugin<[Setter<DragState>]>({
	name: 'solid-state-sync',
	priority: -1000, // Run last to ensure we get final values
	cancelable: false,

	start: ([setState], ctx) => {
		ctx.effect.immediate(() => {
			setState((prev) => ({
				...prev,
				isDragging: true,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
			}));
		});
	},

	drag: ([setState], ctx) => {
		ctx.effect.immediate(() => {
			setState((prev) => ({
				...prev,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
			}));
		});
	},

	end: ([setState], ctx) => {
		ctx.effect.immediate(() => {
			setState((prev) => ({
				...prev,
				isDragging: false,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
			}));
		});
	},
});

export function wrapper(draggableFactory: ReturnType<typeof createDraggable>) {
	return (
		element: Accessor<HTMLElement | SVGElement | null | undefined>,
		plugins: Accessor<Plugin[]> = () => [],
	) => {
		const [drag_state, set_drag_state] = createSignal<DragState>(default_drag_state);
		let instance: ReturnType<typeof draggableFactory.draggable> | undefined;
		const state_sync_plugin = state_sync(set_drag_state);

		onMount(() => {
			const node = element();
			if (!node) return;
			instance = draggableFactory.draggable(node, plugins().concat(state_sync_plugin));
			onCleanup(() => instance?.destroy());
		});

		createEffect(() => {
			if (!instance) return;
			instance.update(plugins().concat(state_sync_plugin));
		});

		return drag_state;
	};
}

export const useDraggable = wrapper(draggable_factory);

// Export necessary types and utilities
export * from '@neodrag/core/plugins';
export const instances = draggable_factory.instances;
