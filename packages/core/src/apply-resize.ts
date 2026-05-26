import type { ResizeEdge } from './resize/types.ts';

export type ResizeApplier = (args: {
	size: { width: string; height: string };
	sizePx: { width: number; height: number };
	rootNode: HTMLElement | SVGElement;
	anchor: ResizeEdge;
}) => void;

export type ResizeLayoutOrigin = {
	initialWidth: number;
	initialHeight: number;
	left: number;
	top: number;
	translateX: number;
	translateY: number;
	useLeft: boolean;
	useTop: boolean;
};

const SIZE_CACHE = Symbol('neodrag.sizeCache');

type SizeCache = { width: string; height: string };

function sizeCache(node: HTMLElement): SizeCache {
	const host = node as HTMLElement & { [SIZE_CACHE]?: SizeCache };
	return (host[SIZE_CACHE] ??= { width: '', height: '' });
}

function parseTranslatePx(translate: string) {
	if (!translate || translate === 'none') return { x: 0, y: 0 };
	const p = translate.split(/\s+/);
	return {
		x: Number.parseFloat(p[0]!) || 0,
		y: Number.parseFloat(p[1]!) || 0,
	};
}

function parseLengthPx(value: string) {
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}

export function captureResizeLayout(
	node: HTMLElement,
	sizePx?: { width: number; height: number },
): ResizeLayoutOrigin {
	const cs = getComputedStyle(node);
	const { x, y } = parseTranslatePx(cs.translate);
	return {
		initialWidth: sizePx?.width ?? node.offsetWidth,
		initialHeight: sizePx?.height ?? node.offsetHeight,
		left: parseLengthPx(cs.left),
		top: parseLengthPx(cs.top),
		translateX: x,
		translateY: y,
		useLeft: cs.left !== 'auto',
		useTop: cs.top !== 'auto',
	};
}

export function applyResizeOrigin(
	node: HTMLElement,
	anchor: ResizeEdge,
	origin: ResizeLayoutOrigin,
	sizePx: { width: number; height: number },
) {
	const dw = sizePx.width - origin.initialWidth;
	const dh = sizePx.height - origin.initialHeight;
	let left = origin.left;
	let top = origin.top;
	let tx = origin.translateX;
	let ty = origin.translateY;

	if (anchor.includes('w')) {
		if (origin.useLeft) left -= dw;
		else tx -= dw;
	}
	if (anchor.includes('n')) {
		if (origin.useTop) top -= dh;
		else ty -= dh;
	}

	if (origin.useLeft) node.style.left = `${left}px`;
	if (origin.useTop) node.style.top = `${top}px`;
	node.style.translate = `${tx}px ${ty}px`;
}

export function restoreResizeLayout(node: HTMLElement, origin: ResizeLayoutOrigin) {
	if (origin.useLeft) node.style.left = `${origin.left}px`;
	if (origin.useTop) node.style.top = `${origin.top}px`;
	node.style.translate = `${origin.translateX}px ${origin.translateY}px`;
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
	origin?: ResizeLayoutOrigin | null,
) {
	if (custom) {
		custom({ size, sizePx, rootNode: node, anchor });
		return;
	}
	applyResizeDefault(node, size);
	if (origin && node instanceof HTMLElement) {
		applyResizeOrigin(node, anchor, origin, sizePx);
	}
}
