import { numberStub, resolveSizeInput } from '../../length-contract.ts';
import { lengthContext } from '../../length/utils.ts';
import type { SortableContext } from '../context.ts';
import { sortableRegistry } from '../context.ts';
import {
	fmtPoint,
	fmtRect,
	sortableStory,
} from '../agent-log.ts';
import { resolvePreset, resolveStrategyInput } from '../strategy/resolve.ts';
import type { SizeInput } from '../../length-runtime.ts';

function sortableDragPointer<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): { x: number; y: number } {
	const node = sourceCtx.nodesByKey.get(dragKey);
	if (node instanceof HTMLElement) {
		const rect = node.getBoundingClientRect();
		return { x: (rect.left + rect.right) / 2, y: (rect.top + rect.bottom) / 2 };
	}
	return { x: pointerX, y: pointerY };
}

export function distancePointToRect(
	px: number,
	py: number,
	rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
): number {
	const dx = Math.max(rect.left - px, 0, px - rect.right);
	const dy = Math.max(rect.top - py, 0, py - rect.bottom);
	return Math.hypot(dx, dy);
}

function distanceToRectCenter(
	px: number,
	py: number,
	rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
): number {
	const cx = (rect.left + rect.right) / 2;
	const cy = (rect.top + rect.bottom) / 2;
	return Math.hypot(px - cx, py - cy);
}

function unionClientRects(rects: readonly DOMRect[]): DOMRect | null {
	if (!rects.length) return null;
	let left = Infinity;
	let top = Infinity;
	let right = -Infinity;
	let bottom = -Infinity;
	for (const rect of rects) {
		left = Math.min(left, rect.left);
		top = Math.min(top, rect.top);
		right = Math.max(right, rect.right);
		bottom = Math.max(bottom, rect.bottom);
	}
	return {
		left,
		top,
		right,
		bottom,
		width: right - left,
		height: bottom - top,
		x: left,
		y: top,
		toJSON: () => ({}),
	} as DOMRect;
}

export function resolveForeignContentRect<T>(
	targetCtx: SortableContext<T>,
	container: HTMLElement,
): DOMRect {
	const rects: DOMRect[] = [];
	for (const item of targetCtx.opts.items()) {
		const key = targetCtx.opts.keyBy(item);
		const node = targetCtx.nodesByKey.get(key);
		if (node instanceof HTMLElement) rects.push(node.getBoundingClientRect());
	}
	return unionClientRects(rects) ?? container.getBoundingClientRect();
}

function approachAxisForTarget<T>(targetCtx: SortableContext<T>): 'x' | 'y' {
	const preset =
		resolvePreset(resolveStrategyInput(targetCtx.opts.strategy)) ?? 'vertical';
	return preset === 'horizontal' ? 'x' : 'y';
}

export function overlapsCrossAxis(
	px: number,
	py: number,
	rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
	approach: 'x' | 'y',
): boolean {
	if (approach === 'x') return py >= rect.top && py <= rect.bottom;
	return px >= rect.left && px <= rect.right;
}

export function pointInClientRect(
	px: number,
	py: number,
	rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
): boolean {
	return px >= rect.left && px <= rect.right && py >= rect.top && py <= rect.bottom;
}

export function approachAxisForForeignTarget<T>(targetCtx: SortableContext<T>): 'x' | 'y' {
	return approachAxisForTarget(targetCtx);
}

export function pointerBeyondForeignContent(
	pointerX: number,
	pointerY: number,
	contentRect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
	approach: 'x' | 'y',
): boolean {
	if (approach === 'x') return pointerX > contentRect.right;
	return pointerY > contentRect.bottom;
}

export function foreignColumnShouldAppendAtEnd<T>(
	targetCtx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
	contentRect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
	approach: 'x' | 'y',
): boolean {
	if (!pointerInForeignColumnContainer(targetCtx, pointerX, pointerY)) return false;
	if (pointerBeyondForeignContent(pointerX, pointerY, contentRect, approach)) return true;
	if (
		!overlapsCrossAxis(pointerX, pointerY, contentRect, approach) &&
		targetCtx.opts.items().length <= 1
	) {
		return true;
	}
	return false;
}

export function pointerInForeignColumnContainer<T>(
	targetCtx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
): boolean {
	const container = targetCtx.containerNode;
	if (!(container instanceof HTMLElement)) return false;
	const containerRect = container.getBoundingClientRect();
	const approach = approachAxisForTarget(targetCtx);
	return (
		pointInClientRect(pointerX, pointerY, containerRect) &&
		overlapsCrossAxis(pointerX, pointerY, containerRect, approach)
	);
}

function distanceApproachAxis(
	px: number,
	py: number,
	rect: Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>,
	approach: 'x' | 'y',
): number {
	if (approach === 'x') return Math.max(rect.left - px, 0, px - rect.right);
	return Math.max(rect.top - py, 0, py - rect.bottom);
}

export function resolveForeignProximityPx<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
): number {
	const node = sourceCtx.nodesByKey.get(dragKey);
	const ref = node instanceof HTMLElement ? node : document.documentElement;
	const nodeRect =
		node instanceof HTMLElement ? node.getBoundingClientRect() : null;
	const fallback = nodeRect ? Math.min(nodeRect.width, nodeRect.height) * 0.35 : 32;

	const input: SizeInput | undefined = sourceCtx.opts.foreignProximity;
	if (input == null) return Math.max(24, fallback);

	const adapter = sourceCtx.opts.length ?? numberStub;
	return Math.max(
		8,
		resolveSizeInput(adapter, input, lengthContext(ref, 'x'), fallback),
	);
}

const POINTER_HIT_BIAS = 0;
const DRAG_CENTER_HIT_BIAS = 1_000;
const POINTER_PROXIMITY_BIAS = 2_000;
const DRAG_PROXIMITY_BIAS = 3_000;

function scoreSample(
	px: number,
	py: number,
	hitRect: DOMRect,
	approach: 'x' | 'y',
	threshold: number,
	allowProximityBand: boolean,
	biases: { inside: number; proximity: number },
): number | null {
	const crossOverlap = overlapsCrossAxis(px, py, hitRect, approach);
	if (!crossOverlap) return null;

	const approachDist = distanceApproachAxis(px, py, hitRect, approach);
	if (approachDist === 0) {
		return biases.inside + distanceToRectCenter(px, py, hitRect);
	}
	if (!allowProximityBand || approachDist > threshold) return null;
	return biases.proximity + approachDist;
}

export function scoreForeignTargetProximity<T>(
	targetCtx: SortableContext<T>,
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): number | null {
	const container = targetCtx.containerNode;
	if (!(container instanceof HTMLElement)) return null;

	const hasItems = targetCtx.opts.items().length > 0;
	const containerRect = container.getBoundingClientRect();
	const contentRect = resolveForeignContentRect(targetCtx, container);
	const approach = approachAxisForTarget(targetCtx);
	const dragPoint = sortableDragPointer(sourceCtx, dragKey, pointerX, pointerY);
	const threshold = resolveForeignProximityPx(sourceCtx, dragKey);
	const allowProximityBand = hasItems;

	const pointerInColumn = pointerInForeignColumnContainer(targetCtx, pointerX, pointerY);
	const dragInColumn = pointerInForeignColumnContainer(targetCtx, dragPoint.x, dragPoint.y);

	if (!pointerInColumn && !dragInColumn) {
		return null;
	}

	const pointerScore =
		scoreSample(
			pointerX,
			pointerY,
			contentRect,
			approach,
			threshold,
			allowProximityBand,
			{ inside: POINTER_HIT_BIAS, proximity: POINTER_PROXIMITY_BIAS },
		) ?? Infinity;
	const dragScore =
		scoreSample(
			dragPoint.x,
			dragPoint.y,
			contentRect,
			approach,
			threshold,
			allowProximityBand,
			{ inside: DRAG_CENTER_HIT_BIAS, proximity: DRAG_PROXIMITY_BIAS },
		) ?? Infinity;

	let score = pointerScore;
	if (!Number.isFinite(score)) score = dragScore;
	if (!Number.isFinite(score)) {
		if (pointerInColumn) {
			score =
				POINTER_HIT_BIAS +
				distanceApproachAxis(pointerX, pointerY, contentRect, approach) +
				distanceToRectCenter(pointerX, pointerY, contentRect);
		} else if (dragInColumn) {
			score =
				DRAG_CENTER_HIT_BIAS +
				distanceApproachAxis(dragPoint.x, dragPoint.y, contentRect, approach) +
				distanceToRectCenter(dragPoint.x, dragPoint.y, contentRect);
		} else {
			return null;
		}
	}

	// #region agent log
	const pointerApproach = distanceApproachAxis(pointerX, pointerY, contentRect, approach);
	const dragApproach = distanceApproachAxis(dragPoint.x, dragPoint.y, contentRect, approach);
	const pointerCross = overlapsCrossAxis(pointerX, pointerY, containerRect, approach);
	const dragCross = overlapsCrossAxis(dragPoint.x, dragPoint.y, containerRect, approach);
	const winner =
		score === pointerScore || !Number.isFinite(pointerScore)
			? 'cursor'
			: score === dragScore
				? 'chip center (fallback)'
				: 'column padding fallback';
	sortableStory('J', 'foreign-proximity.ts', `column score · ${String(targetCtx.id)}`, () => ({
		story: [
			`Scoring friend column ${String(targetCtx.id)} (${hasItems ? 'has chips' : 'empty'}) for drag "${dragKey}".`,
			`${fmtPoint(pointerX, pointerY)} vs chip ${fmtPoint(dragPoint.x, dragPoint.y, 'center')}; content ${fmtRect(contentRect)}; approach axis ${approach}; proximity band ${Math.round(threshold)}px.`,
			`Cursor: cross-axis in column=${pointerCross}, along-axis gap=${Math.round(pointerApproach)}px.`,
			`Chip center: cross-axis=${dragCross}, along-axis gap=${Math.round(dragApproach)}px.`,
			`Composite score ${Math.round(score)} (lower wins). Sample used: ${winner}.`,
		].join(' '),
		data: {
			targetId: String(targetCtx.id),
			dragKey,
			hasItems,
			approach,
			threshold,
			score,
			pointerApproach,
			dragApproach,
			pointerCross,
			dragCross,
			hitRect: {
				left: contentRect.left,
				top: contentRect.top,
				right: contentRect.right,
				bottom: contentRect.bottom,
			},
			pointer: { x: pointerX, y: pointerY },
			dragCenter: dragPoint,
		},
	}));
	// #endregion

	return score;
}

export function pickBestForeignTarget<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): SortableContext<T> | null {
	const group = sourceCtx.opts.group;
	if (!group) return null;

	let best: SortableContext<T> | null = null;
	let bestScore = Infinity;

	for (const targetCtx of sortableRegistry.values()) {
		if (targetCtx.id === sourceCtx.id) continue;
		if (targetCtx.opts.group !== group) continue;
		if (!(targetCtx.containerNode instanceof HTMLElement)) continue;

		const score = scoreForeignTargetProximity(
			targetCtx as SortableContext<T>,
			sourceCtx,
			dragKey,
			pointerX,
			pointerY,
		);
		if (score == null || score >= bestScore) continue;
		bestScore = score;
		best = targetCtx as SortableContext<T>;
	}

	// #region agent log
	if (best) {
		sortableStory('J', 'foreign-proximity.ts', `column winner · ${dragKey}`, () => ({
		story: [
				`${fmtPoint(pointerX, pointerY)} — best friend column is ${String(best.id)} (score ${Math.round(bestScore)}).`,
				'Lower scores beat higher; other grouped columns were worse or out of range.',
			].join(' '),
		data: {
				dragKey,
				winnerId: String(best.id),
				bestScore,
				pointerX,
				pointerY,
			},
	}));
	}
	// #endregion

	return best;
}

export function isGroupedForeignDropPending<T>(
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): boolean {
	if (!sourceCtx.opts.group) return false;
	return pickBestForeignTarget(sourceCtx, dragKey, pointerX, pointerY) != null;
}

export function isActiveForeignTarget<T>(
	targetCtx: SortableContext<T>,
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): boolean {
	const best = pickBestForeignTarget(sourceCtx, dragKey, pointerX, pointerY);
	return best?.id === targetCtx.id;
}
