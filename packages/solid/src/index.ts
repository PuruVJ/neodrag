import { DraggableFactory } from '@neodrag/core';
import {
	Compartment,
	DragEventData,
	PluginContext,
	PluginResolver,
	unstable_definePlugin,
	type Plugin,
} from '@neodrag/core/plugins';
import type { Accessor, Setter } from 'solid-js';
import { createEffect, createRenderEffect, createSignal, untrack } from 'solid-js';

const draggable_factory = new DraggableFactory();

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

const state_sync = unstable_definePlugin((set_state: Setter<DragState>) => {
	const update_state = (
		ctx: PluginContext,
		event: PointerEvent,
		overrides: Partial<DragState> = {},
	) =>
		ctx.effect.immediate(() =>
			set_state((prev) => ({
				...prev,
				offset: { ...ctx.offset },
				rootNode: ctx.rootNode,
				currentNode: ctx.currentlyDraggedNode,
				event,
				...overrides,
			})),
		);

	return {
		name: 'sss', // solid-state-sync
		priority: -1000,
		cancelable: false,
		start: (ctx, _state, event) => update_state(ctx, event, { isDragging: true }),
		drag: (ctx, _state, event) => update_state(ctx, event),
		end: (ctx, _state, event) => update_state(ctx, event, { isDragging: false }),
	};
});

function resolve_plugins(
	plugins: Accessor<Plugin[]> | ReturnType<PluginResolver>,
	state_sync_plugin: Plugin,
) {
	const p = typeof plugins === 'function' ? plugins() : () => plugins;

	if (typeof p === 'function') {
		return () => p().concat(state_sync_plugin);
	} else {
		return p.concat(state_sync_plugin);
	}
}

function wrapper(draggableFactory: DraggableFactory) {
	return (
		element: Accessor<HTMLElement | SVGElement | null | undefined>,
		plugins: Accessor<Plugin[]> | ReturnType<PluginResolver> = () => [],
	) => {
		const [drag_state, set_drag_state] = createSignal<DragState>(default_drag_state);
		const state_sync_plugin = state_sync(set_drag_state);

		createEffect(() => {
			const node = element();
			if (!node) return;

			return draggableFactory.draggable(
				node,
				untrack(() => resolve_plugins(plugins, state_sync_plugin)),
			);
		});

		return drag_state;
	};
}

export const useDraggable = wrapper(draggable_factory);

export function createCompartment<T extends Plugin>(reactive: () => T) {
	const compartment = new Compartment(() => untrack(reactive));

	createRenderEffect(() => {
		compartment.current = reactive();
	});

	return compartment;
}

export * from '@neodrag/core/plugins';
export const instances = draggable_factory.instances;
