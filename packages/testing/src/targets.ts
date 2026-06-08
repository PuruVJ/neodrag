import type { Point } from './kinematics.ts';

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const RESIZE_HANDLE_ATTR = 'data-neodrag-resize-handle';

export type ElementLike = Element | { element(): Element | Promise<Element> };

export async function resolveElement(el: ElementLike): Promise<Element> {
	if ('element' in el && typeof el.element === 'function') {
		return el.element();
	}
	return el as Element;
}

export function rectOf(el: Element): DOMRect {
	return el.getBoundingClientRect();
}

export function centerOfRect(rect: DOMRect): Point {
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

export async function centerOf(el: ElementLike): Promise<Point> {
	const dom = await resolveElement(el);
	return centerOfRect(rectOf(dom));
}

export async function resolveHandle(root: ElementLike, edge: ResizeEdge): Promise<{
	handle: HTMLElement;
	point: Point;
}> {
	const dom = await resolveElement(root);
	const handle = dom.querySelector(`[${RESIZE_HANDLE_ATTR}="${edge}"]`) as HTMLElement | null;
	if (!handle) {
		throw new Error(`Resize handle not found: ${edge}`);
	}
	return { handle, point: centerOfRect(handle.getBoundingClientRect()) };
}

export async function sortableItems(list: ElementLike): Promise<Element[]> {
	const dom = await resolveElement(list);
	return [...dom.querySelectorAll('[data-sortable-key]')];
}

export async function keyAt(list: ElementLike, index: number): Promise<string | null> {
	const items = await sortableItems(list);
	return items[index]?.getAttribute('data-sortable-key') ?? null;
}

export async function sortableItemAt(list: ElementLike, index: number): Promise<Element> {
	const items = await sortableItems(list);
	const item = items[index];
	if (!item) throw new Error(`Sortable item at index ${index} not found`);
	return item;
}

export function dropZoneRect(zone: Element): DOMRect {
	return zone.getBoundingClientRect();
}

export type RectSide = 'top' | 'bottom' | 'left' | 'right';

export function edgePoint(rect: DOMRect, side: RectSide, insetPx = 4, outside = false): Point {
	const sign = outside ? -1 : 1;
	switch (side) {
		case 'top':
			return { x: rect.left + rect.width / 2, y: rect.top + sign * insetPx };
		case 'bottom':
			return { x: rect.left + rect.width / 2, y: rect.bottom - sign * insetPx };
		case 'left':
			return { x: rect.left + sign * insetPx, y: rect.top + rect.height / 2 };
		case 'right':
			return { x: rect.right - sign * insetPx, y: rect.top + rect.height / 2 };
	}
}

export async function midpointBetween(a: ElementLike, b: ElementLike): Promise<Point> {
	const ra = rectOf(await resolveElement(a));
	const rb = rectOf(await resolveElement(b));
	return {
		x: (ra.left + ra.right + rb.left + rb.right) / 4,
		y: (ra.top + rb.bottom) / 2,
	};
}

export async function indexOfSortableItem(item: ElementLike, list: ElementLike): Promise<number> {
	const dom = await resolveElement(item);
	const key = dom.getAttribute('data-sortable-key');
	const items = await sortableItems(list);
	return items.findIndex((n) => n.getAttribute('data-sortable-key') === key);
}

export async function keysFromList(list: ElementLike): Promise<string[]> {
	const items = await sortableItems(list);
	return items.map((n) => n.getAttribute('data-sortable-key')!).filter(Boolean);
}
