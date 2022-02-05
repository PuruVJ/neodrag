import { draggable, DragOptions } from '@neodrag/svelte';
import React, { useEffect, useRef, useState } from 'react';

// TODO: Implement this later after all @neodrag/* are done and tests written for
// export const Draggable: React.FC<DragOptions> = ({ children, ...options }) => {
// 	const draggableRef = useRef<HTMLDivElement>(null);
// 	useDraggable(draggableRef, options);

// 	return <div ref={draggableRef}>{children}</div>;
// };

type DragState = Parameters<Exclude<DragOptions['onDrag'], undefined>>[number];

export function useDraggable<RefType extends HTMLElement = HTMLDivElement>(
	nodeRef: React.RefObject<RefType>,
	options: DragOptions = {}
) {
	const updateRef = useRef<(options: DragOptions) => void>();
	const [isDragging, setIsDragging] = useState(false);
	const [dragState, setDragState] = useState<DragState>();

	let { onDragStart, onDrag, onDragEnd } = options;

	function callEvent(arg: DragState, cb: DragOptions['onDrag']) {
		setDragState(arg);
		cb?.(arg);
	}

	function customOnDragStart(arg: DragState) {
		setIsDragging(true);
		callEvent(arg, onDragStart);
	}

	function customOnDrag(arg: DragState) {
		callEvent(arg, onDrag);
	}

	function customOnDragEnd(arg: DragState) {
		setIsDragging(false);
		callEvent(arg, onDragEnd);
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const node = nodeRef.current;
		if (!node) return;

		// Update callbacks
		({ onDragStart, onDrag, onDragEnd } = options);

		const { update, destroy } = draggable(node, {
			...options,
			onDragStart: customOnDragStart,
			onDrag: customOnDrag,
			onDragEnd: customOnDragEnd,
		});

		updateRef.current = update;

		return destroy;
	}, []);

	useEffect(() => {
		updateRef.current?.({
			...options,
			onDragStart: customOnDragStart,
			onDrag: customOnDrag,
			onDragEnd: customOnDragEnd,
		});
	}, [options]);

	return { isDragging, dragState };
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragOptions } from '@neodrag/svelte';
