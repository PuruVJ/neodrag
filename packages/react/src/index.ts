import {
	Neodrag,
	defineDragPlugin,
	type DragEventData,
	type DragPlugin,
	type DragPluginInput,
} from '@neodrag/core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const engine = Neodrag.shared;

export type ReactiveDragPluginInput = DragPluginInput | (() => DragPluginInput);

export interface DragState extends DragEventData {
	isDragging: boolean;
}

const defaultState: DragState = {
	offset: { x: 0, y: 0 },
	rootNode: null as unknown as HTMLElement,
	visualNode: null as unknown as HTMLElement,
	isDragging: false,
	event: null as unknown as PointerEvent,
};

function resolvePlugins(plugins: ReactiveDragPluginInput): DragPluginInput {
	return typeof plugins === 'function' ? plugins() : plugins;
}

const createSyncPlugin = (setState: React.Dispatch<React.SetStateAction<DragState>>) =>
	defineDragPlugin(() => ({
		key: Symbol('neodrag.react-state-sync'),
		name: 'react-state-sync',
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
	ref: React.RefObject<HTMLElement | SVGElement | null>,
	plugins: ReactiveDragPluginInput = [],
) {
	const [state, setState] = useState<DragState>(defaultState);
	const sync = useRef(createSyncPlugin(setState));
	const handleRef = useRef<ReturnType<typeof engine.draggable> | null>(null);
	const pluginsRef = useRef(plugins);
	pluginsRef.current = plugins;

	useEffect(() => {
		const node = ref.current;
		if (!node) return;

		const handle = engine.draggable(node, withSync(pluginsRef.current, sync.current));
		handleRef.current = handle;

		return () => {
			handle.destroy();
			handleRef.current = null;
		};
	}, [ref]);

	useLayoutEffect(() => {
		const node = ref.current;
		const handle = handleRef.current;
		if (!node || !handle) return;
		handle.update(withSync(plugins, sync.current));
	});
}

export * from '@neodrag/core/plugins';
export { Neodrag };
