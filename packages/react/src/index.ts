import { createDraggable } from '@neodrag/core';
import { DragEventData, unstable_definePlugin, type Plugin } from '@neodrag/core/plugins';
import { useEffect, useRef, useState } from 'react';

const draggable_factory = createDraggable();

interface DragState extends DragEventData {
	isDragging: boolean;
}

const defaultDragState: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	currentNode: null as unknown as HTMLElement,
	isDragging: false,
};

// Create the state sync plugin with the provided setState function
const state_sync = unstable_definePlugin(
	(setDragState: React.Dispatch<React.SetStateAction<DragState>>) => ({
		name: 'react-state-sync',
		priority: -1000, // Run last to ensure we get final values
		cancelable: false,

		dragStart: (ctx) => {
			ctx.effect(() => {
				setDragState((prev) => ({
					...prev,
					isDragging: true,
					offset: { ...ctx.offset },
					rootNode: ctx.rootNode,
					currentNode: ctx.currentlyDraggedNode,
				}));
			});
		},
		drag: (ctx) => {
			ctx.effect(() => {
				setDragState((prev) => ({
					...prev,
					offset: { ...ctx.offset },
					rootNode: ctx.rootNode,
					currentNode: ctx.currentlyDraggedNode,
				}));
			});
		},
		dragEnd: (ctx) => {
			ctx.effect(() => {
				setDragState((prev) => ({
					...prev,
					isDragging: false,
					offset: { ...ctx.offset },
					rootNode: ctx.rootNode,
					currentNode: ctx.currentlyDraggedNode,
				}));
			});
		},
	}),
);

export function wrapper(draggableFactory: ReturnType<typeof createDraggable>) {
	return function useDraggable(
		ref: React.RefObject<HTMLElement | SVGElement | null>,
		plugins: Plugin[] = [],
	) {
		const [dragState, setDragState] = useState<DragState>(defaultDragState);
		const instance = useRef<ReturnType<typeof draggableFactory.draggable>>();
		const pluginsRef = useRef(plugins);
		const syncPluginRef = useRef(state_sync(setDragState));

		// Initialize draggable instance
		useEffect(() => {
			const node = ref.current;
			if (!node) return;

			// Combine user plugins with sync plugin
			pluginsRef.current = plugins;
			instance.current = draggableFactory.draggable(node, [...plugins, syncPluginRef.current]);

			return () => {
				instance.current?.destroy();
				instance.current = undefined;
			};
		}, []); // Only run on mount/unmount

		// Handle plugin updates
		useEffect(() => {
			if (!instance.current || plugins === pluginsRef.current) return;

			pluginsRef.current = plugins;
			instance.current.update([...plugins, syncPluginRef.current]);
		}, [plugins]); // Only run when plugins change

		return dragState;
	};
}

export const useDraggable = wrapper(draggable_factory);

export * from '@neodrag/core/plugins';
export const instances = draggable_factory.instances;
