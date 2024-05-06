import { DragEventData, draggable, DragOptions } from '@neodrag/core';
import React, { useEffect, useRef, useState } from 'react';

type DragState = DragEventData;

type HandleCancelType =
	| string
	| HTMLElement
	| React.RefObject<HTMLElement>
	| (React.RefObject<HTMLElement> | HTMLElement)[]
	| undefined;

function unwrap_handle_cancel(
	val: HandleCancelType,
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
	options: ReactDragOptions = {},
) {
	const update_ref = useRef<(options: DragOptions) => void>();

	const [isDragging, set_is_dragging] = useState(false);
	const [dragState, set_drag_state] = useState<DragState>();

	let { onDragStart, onDrag, onDragEnd, handle, cancel } = options;

	let new_handle = unwrap_handle_cancel(handle);
	let new_cancel = unwrap_handle_cancel(cancel);

	function call_event(arg: DragState, cb: DragOptions['onDrag']) {
		set_drag_state(arg);
		cb?.(arg);
	}

	function custom_on_drag_start(arg: DragState) {
		set_is_dragging(true);
		call_event(arg, onDragStart);
	}

	function custom_on_drag(arg: DragState) {
		call_event(arg, onDrag);
	}

	function custom_on_drag_end(arg: DragState) {
		set_is_dragging(false);
		call_event(arg, onDragEnd);
	}

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const node = nodeRef.current;
		if (!node) return;

		// Update callbacks
		({ onDragStart, onDrag, onDragEnd } = options);

		const { update, destroy } = draggable(node, {
			...options,
			handle: new_handle,
			cancel: new_cancel,
			onDragStart: custom_on_drag_start,
			onDrag: custom_on_drag,
			onDragEnd: custom_on_drag_end,
		});

		update_ref.current = update;

		return destroy;
	}, []);

	useEffect(() => {
		update_ref.current?.({
			...options,
			handle: unwrap_handle_cancel(handle),
			cancel: unwrap_handle_cancel(cancel),
			onDragStart: custom_on_drag_start,
			onDrag: custom_on_drag,
			onDragEnd: custom_on_drag_end,
		});
	}, [options]);

	return { isDragging, dragState };
}

export type { DragAxis, DragBounds, DragBoundsCoords, DragEventData } from '@neodrag/core';
export type { ReactDragOptions as DragOptions };
