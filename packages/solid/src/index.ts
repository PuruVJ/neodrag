import { createDraggable } from '@neodrag/core';
import {
	Compartment,
	DragEventData,
	PluginResolver,
	unstable_definePlugin,
	type Plugin,
} from '@neodrag/core/plugins';
import type { Accessor, Setter } from 'solid-js';
import { createEffect, createSignal, untrack } from 'solid-js';

const draggable_factory = createDraggable();

interface DragState extends DragEventData {
	isDragging: boolean;
}

const default_drag_state: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	currentNode: null as unknown as HTMLElement,
	isDragging: false,
	event: null as unknown as PointerEvent,
};

// Create the state sync plugin with the provided setter function
const state_sync = unstable_definePlugin((setState: Setter<DragState>) => ({
	name: 'solid-state-sync',
	priority: -1000, // Run last to ensure we get final values
	cancelable: false,

	start: (ctx, _state, event) => {
		ctx.effect.immediate(() => {
			setState((prev) => ({
				...prev,
				isDragging: true,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
				event,
			}));
		});
	},

	drag: (ctx, _state, event) => {
		ctx.effect.immediate(() => {
			setState((prev) => ({
				...prev,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
				event,
			}));
		});
	},

	end: (ctx, _state, event) => {
		ctx.effect.immediate(() => {
			setState((prev) => ({
				...prev,
				isDragging: false,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
				event,
			}));
		});
	},
}));

function resolve_plugins(
	plugins: Accessor<Plugin[]> | ReturnType<PluginResolver>,
	state_sync_plugin: Plugin,
) {
	const p =
		typeof plugins === 'function'
			? // Regular reactive plugins
				plugins()
			: // Manual plugins
				() => plugins;

	if (typeof p === 'function') {
		return () => p().concat(state_sync_plugin);
	} else {
		return p.concat(state_sync_plugin);
	}
}

function wrapper(draggableFactory: ReturnType<typeof createDraggable>) {
	return (
		element: Accessor<HTMLElement | SVGElement | null | undefined>,
		plugins: Accessor<Plugin[]> | ReturnType<PluginResolver> = () => [],
	) => {
		const [drag_state, set_drag_state] = createSignal<DragState>(default_drag_state);
		let instance: ReturnType<typeof draggableFactory.draggable> | undefined;
		const state_sync_plugin = state_sync(set_drag_state);
		let is_first_update = true;

		createEffect(() => {
			const node = element();
			if (!node) return;
			instance = draggableFactory.draggable(
				node,
				untrack(() => resolve_plugins(plugins, state_sync_plugin)),
			);

			return () => instance?.destroy();
		});

		// Add debouncing/batching to prevent rapid updates
		createEffect(() => {
			const current_plugins = resolve_plugins(plugins, state_sync_plugin);
			if (is_first_update) {
				is_first_update = false;
				return;
			}

			instance!.update(current_plugins);
		});

		return drag_state;
	};
}

export const useDraggable = wrapper(draggable_factory);

// Option 1: Hook-style (most common SolidJS pattern)
export function createCompartment<T extends Plugin>(reactive: () => T) {
	const compartment = new Compartment(() => untrack(reactive));

	// Automatically track reactive dependencies and update compartment
	createEffect(() => {
		compartment.current = reactive();
	});

	return compartment;
}

// Export necessary types and utilities
export * from '@neodrag/core/plugins';
export const instances = draggable_factory.instances;
