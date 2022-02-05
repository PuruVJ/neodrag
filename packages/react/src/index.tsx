import { draggable, DragOptions } from '@neodrag/svelte';
import React, { useEffect, useRef } from 'react';

// TODO: Implement this later after all @neodrag/* are done and tests written for
// export const Draggable: React.FC<DragOptions> = ({ children, ...options }) => {
// 	const draggableRef = useRef<HTMLDivElement>(null);
// 	useDraggable(draggableRef, options);

// 	return <div ref={draggableRef}>{children}</div>;
// };

export function useDraggable<RefType extends HTMLElement = HTMLDivElement>(
	nodeRef: React.RefObject<RefType>,
	options: DragOptions = {}
) {
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
