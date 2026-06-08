import { is_svg_element } from '../utils.ts';

export function inverseScaleFromNode(node: HTMLElement | SVGElement, layoutRect: DOMRect): number {
	let scale = 1;

	if (is_svg_element(node)) {
		const bbox = (node as SVGGraphicsElement).getBBox();
		if (bbox.width && layoutRect.width) scale = bbox.width / layoutRect.width;
	} else {
		const el = node as HTMLElement;
		if (layoutRect.width) scale = el.offsetWidth / layoutRect.width;
	}

	return Number.isFinite(scale) && scale > 0 ? scale : 1;
}
