import { numberStub, resolveSizeInput, sizeContext } from '../length-contract.ts';
import type { LengthAdapter } from '../length-runtime.ts';
import type { SizeInput } from '../length-runtime.ts';

export type BoundsPadding = {
	top?: SizeInput;
	left?: SizeInput;
	right?: SizeInput;
	bottom?: SizeInput;
};

function resolvePaddingInsets(
	element: HTMLElement | SVGElement,
	adapter: LengthAdapter,
	padding?: BoundsPadding,
): { top: number; left: number; right: number; bottom: number } {
	return {
		top:
			padding?.top != null
				? resolveSizeInput(adapter, padding.top, sizeContext(element, 'y'), 0)
				: 0,
		left:
			padding?.left != null
				? resolveSizeInput(adapter, padding.left, sizeContext(element, 'x'), 0)
				: 0,
		right:
			padding?.right != null
				? resolveSizeInput(adapter, padding.right, sizeContext(element, 'x'), 0)
				: 0,
		bottom:
			padding?.bottom != null
				? resolveSizeInput(adapter, padding.bottom, sizeContext(element, 'y'), 0)
				: 0,
	};
}

export type BoundFromFunction = (data: {
	rootNode: HTMLElement | SVGElement;
	length: LengthAdapter;
}) => [[x1: number, y1: number], [x2: number, y2: number]];

export const BoundsFrom = {
	element(element: HTMLElement, padding?: BoundsPadding): BoundFromFunction {
		return (data) => {
			const rect = element.getBoundingClientRect();
			if (rect.left === 0 && rect.right === 0 && rect.top === 0 && rect.bottom === 0) {
				throw new Error(
					'bounds element has no dimensions. This may happen due to display:contents',
				);
			}
			const pad = resolvePaddingInsets(data.rootNode, data.length, padding);
			return [
				[rect.left + pad.left, rect.top + pad.top],
				[rect.right - pad.right, rect.bottom - pad.bottom],
			];
		};
	},

	selector(selector: string, padding?: BoundsPadding, root?: HTMLElement): BoundFromFunction {
		return (data) => {
			const element = (root ?? document).querySelector<HTMLElement>(selector);
			if (!element)
				throw new Error(`bounds selector ${selector} did not match any elements in the DOM`);
			return BoundsFrom.element(element, padding)(data);
		};
	},

	viewport(padding?: BoundsPadding): BoundFromFunction {
		return (data) => {
			const pad = resolvePaddingInsets(document.documentElement, data.length, padding);
			const left = pad.left;
			const top = pad.top;
			const right = window.innerWidth - pad.right;
			const bottom = window.innerHeight - pad.bottom;
			if (right <= left || bottom <= top) {
				throw new Error('Viewport bounds are invalid after applying padding.');
			}
			return [
				[left, top],
				[right, bottom],
			];
		};
	},

	parent(padding?: BoundsPadding): BoundFromFunction {
		return (data) => BoundsFrom.element(data.rootNode.parentElement as HTMLElement, padding)(data);
	},
};

export function validateBounds(
	bounds: [[number, number], [number, number]],
	element_width: number,
	element_height: number,
): void {
	if (bounds[1][0] - bounds[0][0] < element_width || bounds[1][1] - bounds[0][1] < element_height) {
		throw new Error('Bounds dimensions cannot be smaller than the draggable element dimensions');
	}
}
