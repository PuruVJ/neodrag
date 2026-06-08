import type { Transform } from '../strategy/types.ts';

const TRANSFORM_ATTR = 'data-neodrag-sortable-displaced';

export function formatTransform(t: Transform): string {
	const sx = t.scaleX ?? 1;
	const sy = t.scaleY ?? 1;
	if (sx === 1 && sy === 1) {
		if (t.x === 0 && t.y === 0) return '';
		return `translate3d(${t.x}px, ${t.y}px, 0)`;
	}
	return `translate3d(${t.x}px, ${t.y}px, 0) scale(${sx}, ${sy})`;
}

export function applyTransformToNode(
	el: HTMLElement,
	transform: Transform | null,
	options: { instant?: boolean } = {},
): void {
	if (!transform || (transform.x === 0 && transform.y === 0 && !transform.scaleX && !transform.scaleY)) {
		clearTransformOnNode(el, options);
		return;
	}
	const next = formatTransform(transform);
	if (el.style.transform === next && el.hasAttribute(TRANSFORM_ATTR)) return;
	if (options.instant) el.style.transition = 'none';
	el.style.transform = next;
	el.setAttribute(TRANSFORM_ATTR, '');
	if (options.instant) {
		void el.offsetWidth;
		el.style.transition = '';
	}
}

export function clearTransformOnNode(
	el: HTMLElement,
	options: { instant?: boolean } = {},
): void {
	if (!el.hasAttribute(TRANSFORM_ATTR) && !el.style.transform) return;
	if (options.instant) el.style.transition = 'none';
	el.style.transform = '';
	el.removeAttribute(TRANSFORM_ATTR);
	if (options.instant) {
		void el.offsetWidth;
		el.style.transition = '';
	}
}

export function applyDisplacements(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	byKey: Map<string, Transform>,
	options: { instant?: boolean; dragKey?: string } = {},
): Set<string> {
	const applied = new Set<string>();
	for (const [key, transform] of byKey) {
		if (options.dragKey && key === options.dragKey) continue;
		const node = nodesByKey.get(key);
		if (!(node instanceof HTMLElement)) continue;
		applyTransformToNode(node, transform, options);
		applied.add(key);
	}
	return applied;
}

export function clearDisplacements(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	keys: Iterable<string>,
	options: { instant?: boolean } = {},
): void {
	for (const key of keys) {
		const node = nodesByKey.get(key);
		if (node instanceof HTMLElement) clearTransformOnNode(node, options);
	}
}

export function clearAllDisplacements(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	options: { instant?: boolean } = {},
): void {
	for (const node of nodesByKey.values()) {
		if (node instanceof HTMLElement) clearTransformOnNode(node, options);
	}
}
