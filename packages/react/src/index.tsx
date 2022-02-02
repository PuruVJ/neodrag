import { draggable, DragOptions } from '@neodrag/svelte';
import React, { useEffect, useRef } from 'react';

export const Draggable: React.FC<DragOptions> = ({ children, ...options }) => {
	const draggableRef = useDraggable(options);

	return <div ref={draggableRef}>{children}</div>;
};

export function useDraggable<RefType extends HTMLElement = HTMLDivElement>(
	options: DragOptions = {}
): React.RefObject<RefType> {
	const nodeRef = useRef<RefType>(null);
	const updateRef = useRef<(options: DragOptions) => void>();

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const node = nodeRef.current;
		if (!node) return;

		const { update, destroy } = draggable(node, options);
		updateRef.current = update;

		return destroy;
	}, []);

	useEffect(() => updateRef.current?.(options), [options]);

	return nodeRef;
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from '@neodrag/svelte';
