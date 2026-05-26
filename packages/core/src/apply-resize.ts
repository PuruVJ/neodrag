import type { ResizeEdge } from './resize/types.ts';

export type ResizeApplier = (args: {
	size: { width: string; height: string };
	sizePx: { width: number; height: number };
	rootNode: HTMLElement | SVGElement;
	anchor: ResizeEdge;
}) => void;

const SIZE_CACHE = Symbol('neodrag.sizeCache');

type SizeCache = { width: string; height: string };

function sizeCache(node: HTMLElement): SizeCache {
	const host = node as HTMLElement & { [SIZE_CACHE]?: SizeCache };
	return (host[SIZE_CACHE] ??= { width: '', height: '' });
}

export function applyResizeDefault(
	node: HTMLElement | SVGElement,
	size: { width: string; height: string },
) {
	if (!(node instanceof HTMLElement)) return;
	const cache = sizeCache(node);
	if (cache.width === size.width && cache.height === size.height) return;
	cache.width = size.width;
	cache.height = size.height;
	node.style.width = size.width;
	node.style.height = size.height;
}

export function applyResize(
	node: HTMLElement | SVGElement,
	size: { width: string; height: string },
	sizePx: { width: number; height: number },
	anchor: ResizeEdge,
	custom?: ResizeApplier,
) {
	if (custom) {
		custom({ size, sizePx, rootNode: node, anchor });
		return;
	}
	applyResizeDefault(node, size);
}
