import { createDraggable } from '@neodrag/core';
import {
	Compartment,
	DragEventData,
	PluginInput,
	unstable_definePlugin,
	type Plugin,
} from '@neodrag/core/plugins';
import { useEffect, useRef, useState } from 'react';

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

// Create the state sync plugin with the provided setState function
const state_sync = unstable_definePlugin(
	(setDragState: React.Dispatch<React.SetStateAction<DragState>>) => ({
		name: 'react-state-sync',
		priority: -1000, // Run last to ensure we get final values
		cancelable: false,
		liveUpdate: true,

		start: (ctx, _state, event) => {
			ctx.effect.immediate(() => {
				setDragState((prev) => ({
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
				setDragState((prev) => ({
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
				setDragState((prev) => ({
					...prev,
					isDragging: false,
					offset: { ...ctx.offset },
					rootNode: ctx.rootNode,
					currentNode: ctx.currentlyDraggedNode,
					event,
				}));
			});
		},
	}),
);

function resolve_plugins(plugins: PluginInput, state_sync_plugin: Plugin) {
	if (typeof plugins === 'function') {
		return () => plugins().concat(state_sync_plugin);
	} else {
		return plugins.concat(state_sync_plugin);
	}
}

export function wrapper(draggableFactory: ReturnType<typeof createDraggable>) {
	return (ref: React.RefObject<HTMLElement | SVGElement | null>, plugins: PluginInput = []) => {
		const [drag_state, set_drag_state] = useState<DragState>(default_drag_state);
		const instance = useRef<ReturnType<typeof draggableFactory.draggable>>();
		const state_sync_ref = useRef(state_sync(set_drag_state));
		const pluginsRef = useRef(resolve_plugins(plugins, state_sync_ref.current));
		const is_first_run = useRef(true);

		// Initialize draggable instance
		useEffect(() => {
			const node = ref.current;
			if (!node) return;

			instance.current = draggableFactory.draggable(node, pluginsRef.current);

			return () => instance.current?.destroy();
		}, []); // Changed dependency

		// Handle plugin updates
		useEffect(() => {
			if (is_first_run.current) {
				is_first_run.current = false;
				return;
			}

			if (!instance.current) return;

			pluginsRef.current = resolve_plugins(plugins, state_sync_ref.current);
			instance.current.update();
		}, [plugins]); // Changed dependency

		return drag_state;
	};
}

export function useCompartment<T extends Plugin>(reactive: () => T, deps?: React.DependencyList) {
	const compartment_ref = useRef<Compartment<T>>();

	// Initialize compartment once
	if (!compartment_ref.current) {
		compartment_ref.current = new Compartment(reactive);
	}

	// Update compartment when dependencies change
	useEffect(() => {
		compartment_ref.current!.current = reactive();
	}, deps);

	return compartment_ref.current;
}

export const useDraggable = wrapper(draggable_factory);
export * from '@neodrag/core/plugins';
export const instances = draggable_factory.instances;
