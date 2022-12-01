import { DragEventData, draggable, DragOptions } from '@neodrag/core';
import React, { useEffect, useRef, useState } from 'react';

type DragState = DragEventData;

type HandleCancelType =
	| string
	| HTMLElement
	| React.RefObject<HTMLElement>
	| (React.RefObject<HTMLElement> | HTMLElement)[]
	| undefined;

function unwrapHandleCancel(
	val: HandleCancelType
): string | HTMLElement | HTMLElement[] | undefined {
	if (val == undefined || typeof val === 'string' || val instanceof HTMLElement) return val;
	if ('current' in val) return val.current!;

	if (Array.isArray(val)) {
		// It can only be an array now
		return val.map((v) => (v instanceof HTMLElement ? v : v.current!));
	}
}

type ReactDragOptions = Omit<DragOptions, 'handle' | 'cancel'> & {
	handle?: HandleCancelType;
	cancel?: HandleCancelType;
};

export function useDraggable<RefType extends HTMLElement = HTMLDivElement>(
	nodeRef: React.RefObject<RefType>,
	options: ReactDragOptions = {}
) {
	const updateRef = useRef<(options: DragOptions) => void>();

	const [isDragging, setIsDragging] = useState(false);
	const [dragState, setDragState] = useState<DragState>();

	let { onDragStart, onDrag, onDragEnd, handle, cancel } = options;

	let newHandle = unwrapHandleCancel(handle);
	let newCancel = unwrapHandleCancel(cancel);

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
			handle: newHandle,
			cancel: newCancel,
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
			handle: unwrapHandleCancel(handle),
			cancel: unwrapHandleCancel(cancel),
			onDragStart: customOnDragStart,
			onDrag: customOnDrag,
			onDragEnd: customOnDragEnd,
		});
	}, [options]);

	return { isDragging, dragState };
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragEventData } from '@neodrag/core';
export type { ReactDragOptions as DragOptions };
