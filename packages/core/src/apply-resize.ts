import type { ResizeEdge } from './resize/types.ts';

export type ResizeApplier = (args: {
	size: { width: number; height: number };
	rootNode: HTMLElement | SVGElement;
	anchor: ResizeEdge;
}) => void;

const SIZE_CACHE = Symbol('neodrag.sizeCache');

type SizeCache = { width: number; height: number };

function sizeCache(node: HTMLElement): SizeCache {
	const host = node as HTMLElement & { [SIZE_CACHE]?: SizeCache };
	return (host[SIZE_CACHE] ??= { width: NaN, height: NaN });
}

export function applyResizeDefault(
	node: HTMLElement | SVGElement,
	size: { width: number; height: number },
) {
	if (!(node instanceof HTMLElement)) return;
	const cache = sizeCache(node);
	if (cache.width === size.width && cache.height === size.height) return;
	cache.width = size.width;
	cache.height = size.height;
	node.style.width = `${size.width}px`;
	node.style.height = `${size.height}px`;
}

export function applyResize(
	node: HTMLElement | SVGElement,
	size: { width: number; height: number },
	anchor: ResizeEdge,
	custom?: ResizeApplier,
) {
	if (custom) {
		custom({ size, rootNode: node, anchor });
		return;
	}
	applyResizeDefault(node, size);
}
