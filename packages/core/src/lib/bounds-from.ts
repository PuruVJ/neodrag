export type BoundFromFunction = (data: {
	rootNode: HTMLElement | SVGElement;
}) => [[x1: number, y1: number], [x2: number, y2: number]];

export const BoundsFrom = {
	element(
		element: HTMLElement,
		padding?: { top?: number; left?: number; right?: number; bottom?: number },
	): BoundFromFunction {
		return () => {
			const rect = element.getBoundingClientRect();
			if (rect.left === 0 && rect.right === 0 && rect.top === 0 && rect.bottom === 0) {
				throw new Error(
					'bounds element has no dimensions. This may happen due to display:contents',
				);
			}
			return [
				[rect.left + (padding?.left ?? 0), rect.top + (padding?.top ?? 0)],
				[rect.right - (padding?.right ?? 0), rect.bottom - (padding?.bottom ?? 0)],
			];
		};
	},

	selector(
		selector: string,
		padding?: { top?: number; left?: number; right?: number; bottom?: number },
		root?: HTMLElement,
	): BoundFromFunction {
		return (ctx) => {
			const element = (root ?? document).querySelector<HTMLElement>(selector);
			if (!element)
				throw new Error(`bounds selector ${selector} did not match any elements in the DOM`);
			return BoundsFrom.element(element, padding)(ctx);
		};
	},

	viewport(padding?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	}): BoundFromFunction {
		return () => {
			const left = padding?.left ?? 0;
			const top = padding?.top ?? 0;
			const right = window.innerWidth - (padding?.right ?? 0);
			const bottom = window.innerHeight - (padding?.bottom ?? 0);
			if (right <= left || bottom <= top) {
				throw new Error('Viewport bounds are invalid after applying padding.');
			}
			return [
				[left, top],
				[right, bottom],
			];
		};
	},

	parent(padding?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	}): BoundFromFunction {
		return (ctx) =>
			BoundsFrom.element(ctx.rootNode.parentElement as HTMLElement, padding)(ctx);
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
