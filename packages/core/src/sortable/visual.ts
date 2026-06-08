export {
	SORTABLE_ROW_ATTR,
	sortableRowAttrs,
	SORTABLE_LIFTED_ATTR,
	SORTABLE_PLACEHOLDER_ROW_ATTR,
	findSortableRow,
	type SortableLayoutEntry,
	type SortableLiftState,
	type SortableVisualState,
	buildLayoutEntries,
	averageGap,
	virtualOrderKeys,
	virtualSlotStarts,
	slotBoundariesFromMids,
	stabilizeVisualInsertAt,
	midsFromLayoutEntries,
	siblingShiftPx,
	placeholderRowShiftPx,
	applyPlaceholderRowShift,
	clearPlaceholderRow,
} from './visual/layout.ts';

export { recordFlipRects, playFlip, FLIP_MOVE_THRESHOLD_PX } from './visual/flip.ts';

export {
	clearGroupedSourceElevation,
	syncGroupedSourceElevation,
	SORTABLE_ELEVATED_SOURCE_ATTR,
} from './visual/elevation.ts';

export {
	fixedLocalCoords,
	liftDraggedNode,
	resetSortableChipDragStyles,
	resetOrphanedSortableLift,
	releaseLiftedNode,
	commitLiftedDragOffset,
	clearLiftedDragTransform,
	syncLiftedStyleToViewport,
	clearLiftedDragOffset,
	applySiblingShifts,
	clearSiblingShifts,
	measureFlowPlacementRect,
	resolveLiftedTargetCoordsFromCommitted,
	resolveLiftedTargetCoords,
	animateLiftedToTarget,
	alignLiftedNodeToFlowPlacement,
	liftedReleaseDriftPx,
	clearSiblingTranslatesAnimated,
	clearAllVisuals,
} from './visual/lift.ts';
