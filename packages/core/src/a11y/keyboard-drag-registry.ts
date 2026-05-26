import type { SizeInput } from '../length-runtime.ts';

export type KeyboardDragAxis = 'x' | 'y' | null;

export type ResolvedKeyboardDragOptions = {
	grabKey: string;
	step: number;
	axis: KeyboardDragAxis;
	slowInterval: number;
	speedupDelay: number;
	fastInterval: number;
	fastStep: number;
};

export type KeyboardDragOptions = {
	grabKey?: string;
	step?: SizeInput;
	axis?: KeyboardDragAxis;
	slowInterval?: number;
	speedupDelay?: number;
	fastInterval?: number;
	fastStep?: number;
};

const registry = new WeakMap<HTMLElement | SVGElement, ResolvedKeyboardDragOptions>();

export function registerKeyboardDrag(
	node: HTMLElement | SVGElement,
	options: ResolvedKeyboardDragOptions,
): void {
	registry.set(node, options);
}

export function unregisterKeyboardDrag(node: HTMLElement | SVGElement): void {
	registry.delete(node);
}

export function getKeyboardDragConfig(
	node: HTMLElement | SVGElement,
): ResolvedKeyboardDragOptions | undefined {
	return registry.get(node);
}

export function findKeyboardDragRoot(target: EventTarget | null): HTMLElement | SVGElement | null {
	let el: Element | null =
		target instanceof Element ? target : target instanceof Node ? (target as Node).parentElement : null;
	while (el) {
		if (registry.has(el as HTMLElement)) return el as HTMLElement | SVGElement;
		el = el.parentElement;
	}
	const active = document.activeElement;
	if (active instanceof HTMLElement && registry.has(active)) return active;
	return null;
}
