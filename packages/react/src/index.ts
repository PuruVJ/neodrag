import { DEFAULTS, DraggableFactory } from '@neodrag/core';
import {
	Compartment,
	DragEventData,
	PluginContext,
	PluginInput,
	unstable_definePlugin,
	type Plugin,
} from '@neodrag/core/plugins';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const factory = new DraggableFactory(DEFAULTS);

interface DragState extends DragEventData {
	isDragging: boolean;
}

const defaultState: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	currentNode: null as unknown as HTMLElement,
	isDragging: false,
	event: null as unknown as PointerEvent,
};

const create_sync_plugin = (setState: React.Dispatch<React.SetStateAction<DragState>>) => {
	const update_state = (
		ctx: PluginContext,
		event: PointerEvent,
		overrides: Partial<DragState> = {},
	) =>
		ctx.effect.immediate(() =>
			setState((prev) => ({
				...prev,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
				event,
				...overrides,
			})),
		);

	return unstable_definePlugin(() => ({
		name: 'rss', // react-state-sync
		priority: -1000,
		cancelable: false,
		liveUpdate: true,
		start: (ctx, _, event) => update_state(ctx, event, { isDragging: true }),
		drag: (ctx, _, event) => update_state(ctx, event),
		end: (ctx, _, event) => update_state(ctx, event, { isDragging: false }),
	}));
};

const resolve_plugins = (plugins: PluginInput, sync_plugin: Plugin) =>
	typeof plugins === 'function' ? () => plugins().concat(sync_plugin) : plugins.concat(sync_plugin);

export const wrapper =
	(draggableFactory: DraggableFactory) =>
	(ref: React.RefObject<HTMLElement | SVGElement | null>, plugins: PluginInput = []) => {
		const [state, set_state] = useState<DragState>(defaultState);
		const sync_plugin = useRef(create_sync_plugin(set_state));
		const resolvedPlugins = useRef(resolve_plugins(plugins, sync_plugin.current));

		useEffect(() => {
			if (!ref.current) return;
			return draggableFactory.draggable(ref.current, resolvedPlugins.current);
		}, []);

		return state;
	};

export function useCompartment(reactive: () => Plugin, deps?: React.DependencyList) {
	const compartment = useRef<Compartment>();

	if (!compartment.current) {
		compartment.current = new Compartment(reactive);
	}

	useLayoutEffect(() => {
		compartment.current!.current = reactive();
	}, deps);

	return compartment.current;
}

export const useDraggable = wrapper(factory);
export * from '@neodrag/core/plugins';
export const instances = factory.instances;
