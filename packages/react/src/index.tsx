import { draggable, DragOptions } from '@neodrag/svelte';
import React, { useEffect, useRef } from 'react';

export const Draggable: React.FC<DragOptions> = ({ children }) => {
	const divRef = useRef<HTMLDivElement>(null);
	useDraggable(divRef);

	return (
		<div ref={divRef} style={{ display: 'contents' }}>
			{children}
		</div>
	);
};

export function useDraggable<RefType extends HTMLElement>(
	nodeRef: React.RefObject<RefType>,
	options: DragOptions = {}
) {
	const update = useRef<(options: DragOptions) => void>();

	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (!nodeRef.current) return;

		const dragInstance = draggable(nodeRef.current, options);
		update.current = dragInstance.update;

		return () => dragInstance.destroy();
	}, []);

	useEffect(() => {
		update.current?.(options);
	}, [options]);
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from '@neodrag/svelte';
