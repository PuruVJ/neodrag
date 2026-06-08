import { clearDragTransform } from '../../apply-transform.ts';
import type { DragCtx } from '../../types.ts';
import {
	fmtOffset,
	sortableChipSnapshot,
	sortableRowSnapshot,
	sortableStory,
} from '../agent-log.ts';
import { applySortableRowMarkupAttr } from '../row-markup.ts';
import type { SortableStrategy } from '../types.ts';
import { FLIP_MOVE_THRESHOLD_PX } from './flip.ts';
import {
	findSortableRow,
	SORTABLE_LIFTED_ATTR,
	SORTABLE_PLACEHOLDER_ROW_ATTR,
	clearPlaceholderRow,
	siblingShiftPx,
	virtualSlotStarts,
	type SortableLayoutEntry,
	type SortableLiftState,
} from './layout.ts';

function createsFixedContainingBlock(style: CSSStyleDeclaration): boolean {
	if (style.transform !== 'none') return true;
	if (style.translate !== 'none') return true;
	if (style.perspective !== 'none') return true;
	if (style.filter !== 'none') return true;
	if (style.backdropFilter !== 'none') return true;
	const willChange = style.willChange;
	if (!willChange || willChange === 'auto') return false;
	for (const token of willChange.split(',')) {
		const part = token.trim();
		if (part === 'transform' || part === 'perspective') return true;
	}
	return false;
}

function findFixedContainingBlock(node: HTMLElement): Element {
	let current: Element | null = node.parentElement;
	while (current && current !== document.documentElement) {
		if (createsFixedContainingBlock(getComputedStyle(current))) return current;
		current = current.parentElement;
	}
	return document.documentElement;
}

export function fixedLocalCoords(
	node: HTMLElement,
	rect: DOMRect,
): { left: number; top: number; anchor: string } {
	const block = findFixedContainingBlock(node);
	if (block === document.documentElement) {
		return { left: rect.left, top: rect.top, anchor: 'viewport' };
	}
	const blockRect = block.getBoundingClientRect();
	return {
		left: rect.left - blockRect.left,
		top: rect.top - blockRect.top,
		anchor: block instanceof HTMLElement ? block.tagName + '.' + block.className : block.nodeName,
	};
}

function captureStyle(el: HTMLElement, row: HTMLElement | null): SortableLiftState {
	const style = el.style;
	return {
		position: style.position,
		left: style.left,
		top: style.top,
		width: style.width,
		height: style.height,
		margin: style.margin,
		zIndex: style.zIndex,
		row: row
			? {
					minHeight: row.style.minHeight,
					minWidth: row.style.minWidth,
					flexShrink: row.style.flexShrink,
					position: row.style.position,
					translate: row.style.translate,
					offsetX: 0,
					offsetY: 0,
				}
			: null,
	};
}

function restoreChipStyle(el: HTMLElement, lift: SortableLiftState) {
	const style = el.style;
	style.position = lift.position;
	style.left = lift.left;
	style.top = lift.top;
	style.width = lift.width;
	style.height = lift.height;
	style.margin = lift.margin;
	style.zIndex = lift.zIndex;
}

function fixedTargetViewportCoords(
	node: HTMLElement,
	target: { left: number; top: number },
): { left: number; top: number } {
	const block = findFixedContainingBlock(node);
	if (block === document.documentElement) {
		return { left: target.left, top: target.top };
	}
	const blockRect = block.getBoundingClientRect();
	return {
		left: blockRect.left + target.left,
		top: blockRect.top + target.top,
	};
}

export function liftDraggedNode(
	node: HTMLElement,
	_container: HTMLElement | SVGElement,
): SortableLiftState {
	clearDragTransform(node);
	const rectBefore = node.getBoundingClientRect();
	const rowEl = findSortableRow(
		node,
		_container instanceof HTMLElement ? _container : null,
	);
	// #region agent log
	const dragKey = node.getAttribute('data-sortable-key') ?? '?';
	const chip0 = sortableChipSnapshot(node);
	sortableStory('A', 'visual.ts:liftDraggedNode', `lift begin · ${dragKey}`, () => ({
		story: [
			`Drag started: lifting chip "${dragKey}" off the flow.`,
			chip0?.rect
				? `Chip at (${Math.round(chip0.rect.x)}, ${Math.round(chip0.rect.y)}) before fixed positioning.`
				: 'Chip rect unavailable.',
			rowEl ? 'Placeholder row reserved in the list.' : 'No sortable row wrapper found.',
		].join(' '),
		data: {
			dragKey,
			capturedRow: rowEl ? captureStyle(node, rowEl).row : null,
			liveRow: sortableRowSnapshot(rowEl),
			chip: chip0,
		},
	}));
	// #endregion
	const lift = captureStyle(node, rowEl);
	if (rowEl) {
		rowEl.style.minHeight = `${rectBefore.height}px`;
		rowEl.style.minWidth = `${rectBefore.width}px`;
		rowEl.style.flexShrink = '0';
		if (!rowEl.style.position || getComputedStyle(rowEl).position === 'static') {
			rowEl.style.position = 'relative';
		}
		applySortableRowMarkupAttr(rowEl, SORTABLE_PLACEHOLDER_ROW_ATTR, '1');
	}
	const rowRectBefore = rowEl?.getBoundingClientRect();
	if (lift.row && rowRectBefore) {
		lift.row.offsetX = rectBefore.left - rowRectBefore.left;
		lift.row.offsetY = rectBefore.top - rowRectBefore.top;
	}
	const { left, top } = fixedLocalCoords(node, rectBefore);

	node.style.position = 'fixed';
	node.style.left = `${left}px`;
	node.style.top = `${top}px`;
	node.style.width = `${rectBefore.width}px`;
	node.style.height = `${rectBefore.height}px`;
	node.style.zIndex = '1000';
	node.setAttribute(SORTABLE_LIFTED_ATTR, '1');

	// #region agent log
	const chip1 = sortableChipSnapshot(node);
	sortableStory('A', 'visual.ts:liftDraggedNode', `lift fixed · ${dragKey}`, () => ({
		story: [
			`Chip "${dragKey}" is now position:fixed at (${node.style.left}, ${node.style.top}) with z-index 1000 — follows pointer via translate.`,
			chip1?.rect
				? `Painted rect (${Math.round(chip1.rect.x)}, ${Math.round(chip1.rect.y)}).`
				: '',
		].join(' '),
		data: {
			dragKey,
			chip: chip1,
			row: sortableRowSnapshot(rowEl),
			fixedLeft: node.style.left,
			fixedTop: node.style.top,
		},
	}));
	// #endregion

	return lift;
}

export function resetSortableChipDragStyles(node: HTMLElement) {
	for (const animation of node.getAnimations()) animation.cancel();
	clearDragTransform(node);
	node.style.transform = '';
	node.removeAttribute('data-neodrag-sortable-displaced');
	node.style.translate = '';
	node.style.position = '';
	node.style.left = '';
	node.style.top = '';
	node.style.width = '';
	node.style.height = '';
	node.style.margin = '';
	node.style.zIndex = '';
	node.removeAttribute(SORTABLE_LIFTED_ATTR);
	const row = findSortableRow(node);
	if (row instanceof HTMLElement) {
		for (const animation of row.getAnimations()) animation.cancel();
		row.style.minHeight = '';
		row.style.minWidth = '';
		row.style.flexShrink = '';
		row.style.position = '';
		row.style.marginLeft = '';
		row.style.marginTop = '';
		applySortableRowMarkupAttr(row, SORTABLE_PLACEHOLDER_ROW_ATTR, null);
	}
}

/** @deprecated Use resetSortableChipDragStyles */
export function resetOrphanedSortableLift(node: HTMLElement) {
	resetSortableChipDragStyles(node);
}

export function releaseLiftedNode(node: HTMLElement, lift: SortableLiftState | null) {
	if (!lift) return;
	const row = findSortableRow(node);
	const rowEl = row instanceof HTMLElement ? row : null;
	// #region agent log
	const key = node.getAttribute('data-sortable-key') ?? '?';
	sortableStory('A', 'visual.ts:releaseLiftedNode', `unlift · ${key} (before)`, () => ({
		story: `Dropping "${key}" back into document flow — about to restore pre-lift styles and clear fixed positioning.`,
		data: {
			capturedRow: lift.row,
			liveRow: sortableRowSnapshot(rowEl),
			chip: sortableChipSnapshot(node),
		},
	}));
	// #endregion
	for (const animation of node.getAnimations()) animation.cancel();
	clearDragTransform(node);
	node.style.transform = '';
	restoreChipStyle(node, lift);
	node.removeAttribute(SORTABLE_LIFTED_ATTR);
	// #region agent log
	sortableStory('A', 'visual.ts:releaseLiftedNode', `unlift · ${key} (after)`, () => ({
		story: `"${key}" restored to static/relative flow; placeholder row margins cleared.`,
		data: { liveRow: sortableRowSnapshot(rowEl), chip: sortableChipSnapshot(node) },
	}));
	// #endregion
}

export function commitLiftedDragOffset(node: HTMLElement, dragCtx: DragCtx) {
	const left = parseFloat(node.style.left) || 0;
	const top = parseFloat(node.style.top) || 0;
	const key = node.getAttribute('data-sortable-key');
	const offsetX = dragCtx.offset.x;
	const offsetY = dragCtx.offset.y;
	node.style.left = `${left + offsetX}px`;
	node.style.top = `${top + offsetY}px`;
	clearDragTransform(node);
	dragCtx.setForcedPosition(0, 0);
	// #region agent log
	sortableStory('D', 'visual.ts:commitLiftedDragOffset', `pointer baked into fixed · ${key ?? '?'}`, () => ({
		story: [
			`Merged drag offset (${Math.round(offsetX)}px, ${Math.round(offsetY)}px) into fixed left/top so the chip stays under the cursor.`,
			`Now at (${node.style.left}, ${node.style.top}).`,
		].join(' '),
		data: {
			dragKey: key,
			offsetX,
			offsetY,
			left: node.style.left,
			top: node.style.top,
			chip: sortableChipSnapshot(node),
		},
	}));
	// #endregion
}

export function clearLiftedDragOffset(dragCtx: DragCtx, node: HTMLElement) {
	clearDragTransform(node);
	dragCtx.setForcedPosition(0, 0);
}

/** Visual preview shifts for sortable siblings (does not reflow flex siblings). */
export function applySiblingShifts(
	preLift: SortableLayoutEntry[],
	postLift: SortableLayoutEntry[],
	dragKey: string,
	dragFrom: number,
	insertAt: number,
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	strategy: SortableStrategy,
	options: { instant?: boolean } = {},
): Map<string, { x: number; y: number }> {
	const horizontal = strategy === 'horizontal';
	const applied = new Map<string, { x: number; y: number }>();

	for (const entry of postLift) {
		if (entry.key === dragKey) continue;
		const shift = siblingShiftPx(preLift, postLift, dragFrom, insertAt, entry.index);
		if (shift === 0) continue;
		const el = nodesByKey.get(entry.key);
		if (!el || !(el instanceof HTMLElement)) continue;
		if (el.hasAttribute(SORTABLE_LIFTED_ATTR)) continue;
		const x = horizontal ? shift : 0;
		const y = horizontal ? 0 : shift;
		const next = `${x}px ${y}px`;
		if (el.style.translate === next) {
			applied.set(entry.key, { x, y });
			continue;
		}
		if (options.instant) el.style.transition = 'none';
		el.style.translate = next;
		if (options.instant) {
			void el.offsetWidth;
			el.style.transition = '';
		}
		applied.set(entry.key, { x, y });
	}

	// #region agent log
	const shiftDesc = [...applied.entries()]
		.map(([k, t]) => `"${k}"→(${Math.round(t.x)},${Math.round(t.y)})`)
		.join(', ');
	sortableStory('C', 'visual.ts:applySiblingShifts', `sibling FLIP · ${dragKey}`, () => ({
		story: [
			`Opened gap at index ${insertAt} (was ${dragFrom}) on ${strategy} list — shifting ${applied.size} sibling row(s).`,
			applied.size ? shiftDesc : 'No row margins applied.',
			options.instant ? 'Applied instantly (no transition).' : 'With CSS transition.',
		].join(' '),
		data: {
			dragKey,
			dragFrom,
			insertAt,
			strategy,
			instant: options.instant ?? false,
			shifts: Object.fromEntries(applied),
		},
	}));
	// #endregion

	return applied;
}

export function clearSiblingShifts(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	_keys: Iterable<string>,
) {
	for (const el of nodesByKey.values()) {
		if (!(el instanceof HTMLElement)) continue;
		for (const animation of el.getAnimations()) animation.cancel();
		el.style.transition = 'none';
		el.style.translate = '';
		void el.offsetWidth;
		el.style.transition = '';
	}
}

function roundFixedPx(value: number): number {
	return Math.round(value * 100) / 100;
}

export function measureFlowPlacementRect(node: HTMLElement, lift: SortableLiftState): DOMRect {
	const fixedSnapshot = {
		position: node.style.position,
		left: node.style.left,
		top: node.style.top,
		width: node.style.width,
		height: node.style.height,
		margin: node.style.margin,
		zIndex: node.style.zIndex,
	};
	const style = node.style;
	style.position = lift.position;
	style.left = lift.left;
	style.top = lift.top;
	style.width = lift.width;
	style.height = lift.height;
	style.margin = lift.margin;
	style.zIndex = lift.zIndex;
	node.removeAttribute(SORTABLE_LIFTED_ATTR);
	void node.offsetWidth;
	const rect = node.getBoundingClientRect();
	node.style.position = fixedSnapshot.position;
	node.style.left = fixedSnapshot.left;
	node.style.top = fixedSnapshot.top;
	node.style.width = fixedSnapshot.width;
	node.style.height = fixedSnapshot.height;
	node.style.margin = fixedSnapshot.margin;
	node.style.zIndex = fixedSnapshot.zIndex;
	node.setAttribute(SORTABLE_LIFTED_ATTR, '1');
	return rect;
}

export function resolveLiftedTargetCoordsFromCommitted<T>(
	node: HTMLElement,
	items: readonly T[],
	keyBy: (item: T) => string,
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	dragKey: string,
	insertAt: number,
	strategy: SortableStrategy,
	gap: number,
	lift: SortableLiftState | null,
): { left: number; top: number; source: 'flow' | 'row' | 'neighbors' } {
	void node.offsetWidth;
	const nodeRect = node.getBoundingClientRect();

	const horizontal = strategy === 'horizontal';
	const prevKey = insertAt > 0 ? keyBy(items[insertAt - 1]!) : null;
	const nextKey = insertAt < items.length - 1 ? keyBy(items[insertAt + 1]!) : null;
	const prevR = prevKey ? nodesByKey.get(prevKey)?.getBoundingClientRect() : undefined;
	const nextR = nextKey ? nodesByKey.get(nextKey)?.getBoundingClientRect() : undefined;

	if (prevR || nextR) {
		let targetRect: DOMRect;

		if (horizontal) {
			const top = prevR?.top ?? nextR?.top ?? nodeRect.top;
			let left = nodeRect.left;
			if (!prevR && nextR) {
				left = nextR.left;
			} else if (prevR && !nextR) {
				left = prevR.right + gap;
			} else if (prevR && nextR) {
				const space = nextR.left - prevR.right;
				left =
					space > nodeRect.width + gap
						? prevR.right + (space - nodeRect.width) / 2
						: prevR.right + gap;
			}
			targetRect = new DOMRect(left, top, nodeRect.width, nodeRect.height);
		} else {
			const left = prevR?.left ?? nextR?.left ?? nodeRect.left;
			let top = nodeRect.top;
			if (!prevR && nextR) {
				top = nextR.top;
			} else if (prevR && !nextR) {
				top = prevR.bottom + gap;
			} else if (prevR && nextR) {
				const space = nextR.top - prevR.bottom;
				top =
					space > nodeRect.height + gap
						? prevR.bottom + (space - nodeRect.height) / 2
						: prevR.bottom + gap;
			}
			targetRect = new DOMRect(left, top, nodeRect.width, nodeRect.height);
		}

		const coords = fixedLocalCoords(node, targetRect);
		return {
			left: roundFixedPx(coords.left),
			top: roundFixedPx(coords.top),
			source: 'neighbors',
		};
	}

	const row = findSortableRow(node);
	if (row instanceof HTMLElement) {
		const rowRect = row.getBoundingClientRect();
		if (rowRect.width > 1 && rowRect.height > 1) {
			const targetRect = new DOMRect(
				rowRect.left,
				rowRect.top,
				nodeRect.width,
				nodeRect.height,
			);
			const coords = fixedLocalCoords(node, targetRect);
			return {
				left: roundFixedPx(coords.left),
				top: roundFixedPx(coords.top),
				source: 'row',
			};
		}
	}

	if (lift) {
		const flowRect = measureFlowPlacementRect(node, lift);
		const coords = fixedLocalCoords(node, flowRect);
		return {
			left: roundFixedPx(coords.left),
			top: roundFixedPx(coords.top),
			source: 'flow',
		};
	}

	return {
		left: roundFixedPx(parseFloat(node.style.left) || 0),
		top: roundFixedPx(parseFloat(node.style.top) || 0),
		source: 'row',
	};
}

export function syncLiftedStyleToViewport(node: HTMLElement) {
	const rect = node.getBoundingClientRect();
	const coords = fixedLocalCoords(node, rect);
	node.style.left = `${roundFixedPx(coords.left)}px`;
	node.style.top = `${roundFixedPx(coords.top)}px`;
}

export function clearLiftedDragTransform(node: HTMLElement, dragCtx: DragCtx) {
	clearDragTransform(node);
	dragCtx.setForcedPosition(0, 0);
}

export function resolveLiftedTargetCoords(
	node: HTMLElement,
	_container: HTMLElement | SVGElement,
	preLayout: SortableLayoutEntry[],
	from: number,
	insertAt: number,
	strategy: SortableStrategy,
): { left: number; top: number } {
	const targets = virtualSlotStarts(preLayout, from, insertAt);
	const targetStart = targets.get(from);
	if (targetStart === undefined) {
		return {
			left: parseFloat(node.style.left) || 0,
			top: parseFloat(node.style.top) || 0,
		};
	}

	const rect = node.getBoundingClientRect();
	const horizontal = strategy === 'horizontal';
	const targetRect = horizontal
		? new DOMRect(targetStart, rect.top, rect.width, rect.height)
		: new DOMRect(rect.left, targetStart, rect.width, rect.height);
	return fixedLocalCoords(node, targetRect);
}

export function animateLiftedToTarget(
	node: HTMLElement,
	target: { left: number; top: number },
	duration: number,
): Promise<void> {
	const targetLeft = roundFixedPx(target.left);
	const targetTop = roundFixedPx(target.top);

	if (duration <= 0) {
		node.style.left = `${targetLeft}px`;
		node.style.top = `${targetTop}px`;
		return Promise.resolve();
	}

	const targetViewport = fixedTargetViewportCoords(node, {
		left: targetLeft,
		top: targetTop,
	});
	const rect = node.getBoundingClientRect();
	const dx = targetViewport.left - rect.left;
	const dy = targetViewport.top - rect.top;

	if (Math.abs(dx) < FLIP_MOVE_THRESHOLD_PX && Math.abs(dy) < FLIP_MOVE_THRESHOLD_PX) {
		node.style.left = `${targetLeft}px`;
		node.style.top = `${targetTop}px`;
		return Promise.resolve();
	}

	// #region agent log
	const animKey = node.getAttribute('data-sortable-key') ?? '?';
	sortableStory('H', 'visual.ts:animateLiftedToTarget', `release glide · ${animKey}`, () => ({
		story: [
			`Animating "${animKey}" into its slot with translate ${fmtOffset(targetViewport.left, targetViewport.top, rect.left, rect.top)} over ${duration}ms.`,
			`From fixed (${node.style.left}, ${node.style.top}) → (${targetLeft}px, ${targetTop}px).`,
		].join(' '),
		data: {
			dx,
			dy,
			duration,
			from: { left: node.style.left, top: node.style.top },
			target: { left: targetLeft, top: targetTop },
		},
	}));
	// #endregion

	const animation = node.animate(
		{ translate: [`${dx}px ${dy}px`, '0px 0px'] },
		{ duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
	);

	return new Promise((resolve) => {
		const finish = () => {
			for (const anim of node.getAnimations()) anim.cancel();
			clearDragTransform(node);
			node.style.transform = '';
			node.style.left = `${targetLeft}px`;
			node.style.top = `${targetTop}px`;
			resolve();
		};
		animation.onfinish = finish;
		animation.oncancel = finish;
	});
}

export function alignLiftedNodeToFlowPlacement(
	node: HTMLElement,
	lift: SortableLiftState,
): { left: number; top: number } {
	const flowRect = measureFlowPlacementRect(node, lift);
	const coords = fixedLocalCoords(node, flowRect);
	const left = roundFixedPx(coords.left);
	const top = roundFixedPx(coords.top);
	node.style.left = `${left}px`;
	node.style.top = `${top}px`;
	return { left, top };
}

export function liftedReleaseDriftPx(node: HTMLElement): { dx: number; dy: number } {
	const row = findSortableRow(node);
	if (!(row instanceof HTMLElement)) return { dx: 0, dy: 0 };
	const chip = node.getBoundingClientRect();
	const rowRect = row.getBoundingClientRect();
	return { dx: chip.left - rowRect.left, dy: chip.top - rowRect.top };
}

export function clearSiblingTranslatesAnimated(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	keys: Iterable<string>,
	duration: number,
): Promise<void> {
	const elements: HTMLElement[] = [];
	for (const key of keys) {
		const el = nodesByKey.get(key);
		if (el instanceof HTMLElement && el.style.translate) elements.push(el);
	}
	if (elements.length === 0) return Promise.resolve();

	if (duration <= 0) {
		for (const el of elements) el.style.translate = '';
		return Promise.resolve();
	}

	const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
	for (const el of elements) {
		el.style.transition = `translate ${duration}ms ${easing}`;
		el.style.translate = '';
	}

	return new Promise((resolve) => {
		let remaining = elements.length;
		const done = () => {
			remaining -= 1;
			if (remaining > 0) return;
			for (const el of elements) el.style.transition = '';
			resolve();
		};
		for (const el of elements) {
			el.addEventListener('transitionend', done, { once: true });
		}
	});
}

export function clearAllVisuals(
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	dragKey: string,
	dragNode: HTMLElement | null,
	lift: SortableLiftState | null,
	siblingKeys: Iterable<string>,
) {
	if (dragNode) {
		const row = findSortableRow(dragNode);
		clearPlaceholderRow(row instanceof HTMLElement ? row : null);
		releaseLiftedNode(dragNode, lift);
	}
	clearSiblingShifts(nodesByKey, siblingKeys);
	// #region agent log
	sortableStory('D', 'visual.ts:clearAllVisuals', `drag cancel · ${dragKey}`, () => ({
		story: 'Drag cancelled — releasing lifted chip, clearing placeholder row, resetting sibling translates.',
		data: { dragKey, chip: dragNode ? sortableChipSnapshot(dragNode) : null },
	}));
	// #endregion
}
