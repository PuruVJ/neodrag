import type { DragPlugin, Point } from '../drag/drag.ts';
import type { DndNode } from '../types.ts';

type Targets = ArrayLike<Element> | (() => ArrayLike<Element>);

export interface SnapGuidesOptions {
	/** Elements to align to — a static array/NodeList, or (better) a getter that returns one. The
	 *  property is read fresh at each gesture start, so a `get targets()` getter stays live. */
	targets: Targets;
	/** Snap distance in px — within this, an edge/center locks to a target's. Default `5`. */
	threshold?: number;
	/** Draw the alignment lines while snapped. Default `true`. Style via `--neodrag-snap-guide`. */
	guides?: boolean;
}

type Line = { lines: number[] }; // the three x (or y) lines of a rect: start, center, end

const lines_x = (r: DOMRect): number[] => [r.left, r.left + r.width / 2, r.right];
const lines_y = (r: DOMRect): number[] => [r.top, r.top + r.height / 2, r.bottom];

/** Best snap for one axis: the smallest signed delta (`target_line - dragged_line`) within the
 *  threshold, plus the absolute coordinate of the line we locked to (for drawing the guide). */
function best_snap(dragged: number[], targets: number[][], threshold: number): { delta: number; at: number } | null {
	let best: { delta: number; at: number } | null = null;
	for (const tl of targets) {
		for (const t of tl) {
			for (const d of dragged) {
				const delta = t - d;
				if (Math.abs(delta) <= threshold && (!best || Math.abs(delta) < Math.abs(best.delta))) {
					best = { delta, at: t };
				}
			}
		}
	}
	return best;
}

/**
 * Alignment-guide snapping — the Figma move. While dragging, the element's edges and center snap
 * to the edges/centers of `options.targets` (other elements) within `threshold` px, and a guide line
 * is drawn at each locked axis. A `use: []` plugin — `new Draggable({ use: [snapGuides({ get
 * targets() { return siblings } })] })`.
 *
 * `targets` is the set of elements to align to (an array/NodeList, a getter, or a function returning
 * one — read fresh at each gesture start). The dragged element is skipped automatically.
 */
export function snapGuides(options: SnapGuidesOptions): DragPlugin {
	const threshold = options.threshold ?? 5;
	const draw = options.guides ?? true;

	let start_rect: DOMRect | null = null;
	let start_offset: Point = { x: 0, y: 0 };
	let target_rects_x: number[][] = [];
	let target_rects_y: number[][] = [];
	let guide_x: HTMLElement | null = null;
	let guide_y: HTMLElement | null = null;

	const ensure_guide = (vertical: boolean): HTMLElement => {
		const el = document.createElement('div');
		el.style.cssText = `position:fixed;z-index:2147483646;pointer-events:none;background:var(--neodrag-snap-guide,#ff2d92);${
			vertical ? 'top:0;height:100vh;width:1px;' : 'left:0;width:100vw;height:1px;'
		}`;
		document.body.appendChild(el);
		return el;
	};

	const clear = () => {
		guide_x?.remove();
		guide_y?.remove();
		guide_x = guide_y = null;
	};

	return {
		name: 'snap-guides',
		onStart: ({ offset, node }) => {
			start_rect = node.getBoundingClientRect();
			start_offset = { x: offset.x, y: offset.y };
			const t = options.targets;
			const list = typeof t === 'function' ? t() : t;
			target_rects_x = [];
			target_rects_y = [];
			for (let i = 0; i < list.length; i++) {
				const el = list[i];
				if (!el || el === node) continue;
				const r = el.getBoundingClientRect();
				target_rects_x.push(lines_x(r));
				target_rects_y.push(lines_y(r));
			}
		},
		onMove: ({ offset }): Point => {
			if (!start_rect) return offset;
			// The dragged rect at the *proposed* offset (transform hasn't been applied yet this frame).
			const dx = offset.x - start_offset.x;
			const dy = offset.y - start_offset.y;
			const r = {
				left: start_rect.left + dx,
				top: start_rect.top + dy,
				width: start_rect.width,
				height: start_rect.height,
			} as DOMRect;
			const dragged_x = [r.left, r.left + r.width / 2, r.left + r.width];
			const dragged_y = [r.top, r.top + r.height / 2, r.top + r.height];

			const sx = best_snap(dragged_x, target_rects_x, threshold);
			const sy = best_snap(dragged_y, target_rects_y, threshold);

			if (draw) {
				if (sx) (guide_x ??= ensure_guide(true)).style.left = `${sx.at}px`;
				else {
					guide_x?.remove();
					guide_x = null;
				}
				if (sy) (guide_y ??= ensure_guide(false)).style.top = `${sy.at}px`;
				else {
					guide_y?.remove();
					guide_y = null;
				}
			}

			return { x: offset.x + (sx?.delta ?? 0), y: offset.y + (sy?.delta ?? 0) };
		},
		onEnd: () => {
			clear();
			start_rect = null;
		},
	};
}

/** @internal — re-exported for tests; the pure snap resolver. */
export const _bestSnap = best_snap;
export type { Targets as SnapTargets, Line as SnapLine, DndNode as SnapNode };
