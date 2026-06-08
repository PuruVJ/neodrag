import { useCallback, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { NEODRAG_ATTACH_KEY, type NeodragAttachFn, targetSpreadProps } from './attachments.ts';
import type { Draggable } from './draggable.ts';
import type { Droppable } from './drop/droppable.ts';
import type { Resizable } from './resizable-binding.ts';

type MarkupBinding = {
	readonly target: Record<string, unknown>;
	readonly isDragging?: boolean;
	markupSubscribe(listener: () => void): () => void;
	markupVersion: number;
	hasReactiveSlots: boolean;
	flushReactive(): void;
};

function useMarkupVersion(binding: MarkupBinding): number {
	return useSyncExternalStore(
		(onStoreChange) => binding.markupSubscribe(onStoreChange),
		() => binding.markupVersion,
		() => binding.markupVersion,
	);
}

function useStableSpread(target: Record<string, unknown>, version: number) {
	const attachRef = useRef<NeodragAttachFn | undefined>(undefined);
	attachRef.current = target[NEODRAG_ATTACH_KEY] as NeodragAttachFn | undefined;

	const ref = useCallback((element: HTMLElement | SVGElement | null) => {
		attachRef.current?.(element);
	}, []);

	return useMemo(() => {
		const { [NEODRAG_ATTACH_KEY]: _attach, ...rest } = target;
		void version;
		return { ...rest, ref };
	}, [target, ref, version]);
}

export function useNeodragBinding<T extends MarkupBinding>(binding: T) {
	useLayoutEffect(() => {
		if (binding.hasReactiveSlots) binding.flushReactive();
	});

	const version = useMarkupVersion(binding);
	const spread = useStableSpread(binding.target, version);

	return useMemo(
		() => ({
			target: binding.target,
			spread,
			isDragging: 'isDragging' in binding ? binding.isDragging : undefined,
			binding,
		}),
		[binding, spread, version],
	);
}

export function useDraggableBinding(drag: Draggable) {
	const base = useNeodragBinding(drag);
	return {
		...base,
		isDragging: drag.isDragging,
		draggable: drag,
	};
}

export function useDroppableBinding(drop: Droppable) {
	const base = useNeodragBinding(drop);
	return {
		...base,
		zone: drop.zone,
		droppable: drop,
	};
}

export function useResizableBinding(resize: Resizable) {
	const base = useNeodragBinding(resize);
	return {
		...base,
		frame: resize.frame,
		resizable: resize,
	};
}
