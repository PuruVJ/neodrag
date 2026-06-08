import type { NeodragMarkupAttrs } from './element-props.ts';
import { applyMarkupAttr, type MarkupAdapter } from './markup-adapter.ts';

export const DRAG_MARKUP_NEODRAG = 'data-neodrag';
export const DRAG_MARKUP_STATE = 'data-neodrag-state';
export const DRAG_MARKUP_COUNT = 'data-neodrag-count';

export type DragMarkupState = 'idle' | 'dragging';

export function dragStateMarkupAttrs(count = 0): NeodragMarkupAttrs {
	return {
		[DRAG_MARKUP_NEODRAG]: '',
		[DRAG_MARKUP_STATE]: 'idle',
		[DRAG_MARKUP_COUNT]: String(count),
	};
}

export function applyDragMarkupIdle(
	adapter: MarkupAdapter | undefined,
	node: HTMLElement | SVGElement,
	count = 0,
): void {
	applyMarkupAttr(adapter, node, DRAG_MARKUP_NEODRAG, '');
	applyMarkupAttr(adapter, node, DRAG_MARKUP_STATE, 'idle');
	applyMarkupAttr(adapter, node, DRAG_MARKUP_COUNT, String(count));
}

export function applyDragMarkupDragging(
	adapter: MarkupAdapter | undefined,
	node: HTMLElement | SVGElement,
): void {
	applyMarkupAttr(adapter, node, DRAG_MARKUP_STATE, 'dragging');
}

export function applyDragMarkupEnd(
	adapter: MarkupAdapter | undefined,
	node: HTMLElement | SVGElement,
	count: number,
): void {
	applyMarkupAttr(adapter, node, DRAG_MARKUP_STATE, 'idle');
	applyMarkupAttr(adapter, node, DRAG_MARKUP_COUNT, String(count));
}
