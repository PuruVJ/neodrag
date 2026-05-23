import {
	Neodrag,
	defineDragPlugin,
	resolveDragPlugins,
	type DragEventData,
	type DragPlugin,
	type DragPluginInput,
	Compartment,
} from '@neodrag/core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const engine = Neodrag.shared;

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

function withSync(plugins: DragPluginInput, sync: DragPlugin): DragPluginInput {
	if (typeof plugins === 'function') {
		return () => [...resolveDragPlugins(plugins()), sync];
	}
	return [...plugins, sync];
}

export function useDraggable(
	ref: React.RefObject<HTMLElement | SVGElement | null>,
	plugins: DragPluginInput = [],
) {
	const [state, setState] = useState<DragState>(defaultState);
	const sync = useRef(createSyncPlugin(setState));
	const input = useRef(withSync(plugins, sync.current));

	input.current = withSync(plugins, sync.current);

	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		const handle = engine.draggable(node, input.current);
		return () => handle.destroy();
	}, [ref, plugins]);
}

export function useCompartment(
	reactive: ConstructorParameters<typeof Compartment>[0],
	deps?: React.DependencyList,
) {
	const compartment = useRef<Compartment>();

	if (!compartment.current) {
		compartment.current = new Compartment(reactive);
	}

	useLayoutEffect(() => {
		compartment.current!.current = reactive?.();
	}, deps);

	return compartment.current;
}

export * from '@neodrag/core/plugins';
export { Compartment, Neodrag };
