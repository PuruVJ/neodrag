import type { DragCtx, DragSession } from '../../types.ts';
import { engineExtensions } from '../../engine/extension-registry.ts';
import {
	clearIntentSession,
	type SortableCommit,
	type SortableContext,
	sortableRegistry,
} from '../context.ts';
import { clearSortableVisualPreview } from '../displacement/cleanup.ts';
import {
	clearForeignSortablePreview,
	clearGroupedForeignSortablePreviews,
	resolveForeignInsertAt,
} from '../intent/foreign.ts';
import {
	pickBestForeignTarget,
	pointerInForeignColumnContainer,
} from '../intent/foreign-proximity.ts';
import {
	commitFromIntent,
	isForeignDrag,
	pointerInContainer,
	resolvePreviewMode,
} from '../intent.ts';
import { invalidateMidsCache } from '../mids.ts';
import {
	SORTABLE_GROUP_DROP_HANDLED_KEY,
	SORTABLE_GROUP_DROP_PLAN_KEY,
	SORTABLE_PENDING_GROUP_COMMIT_KEY,
} from '../../sortable-keys.ts';
import { SortableDragData } from '../session-data.ts';
import type { SortableOptions } from '../types.ts';

export type GroupDropPlan<T> =
	| { kind: 'none' }
	| { kind: 'reorder'; sourceId: symbol; commit: SortableCommit<T> }
	| {
			kind: 'transfer';
			sourceId: symbol;
			targetId: symbol;
			item: T;
			from: number;
			to: number;
	  };

export type GroupDropPlanState<T> = {
	plan: GroupDropPlan<T>;
	stickyTargetId: symbol | null;
	lastPointerX: number;
	lastPointerY: number;
	transferPreviewPlan: Extract<GroupDropPlan<T>, { kind: 'transfer' }> | null;
};

export type GroupDropFinalizeResult = {
	handled: boolean;
	needsVisualRelease: boolean;
	dragKey: string;
};

export function createEmptyGroupDropPlanState<T>(): GroupDropPlanState<T> {
	return {
		plan: { kind: 'none' },
		stickyTargetId: null,
		lastPointerX: NaN,
		lastPointerY: NaN,
		transferPreviewPlan: null,
	};
}

export function resetGroupDropPlan(session: DragSession): void {
	session.private.set(SORTABLE_GROUP_DROP_PLAN_KEY, createEmptyGroupDropPlanState());
	session.private.delete(SORTABLE_GROUP_DROP_HANDLED_KEY);
	session.private.delete(SORTABLE_PENDING_GROUP_COMMIT_KEY);
}

export function getGroupDropPlanState<T>(session: DragSession): GroupDropPlanState<T> {
	let state = session.private.get(SORTABLE_GROUP_DROP_PLAN_KEY) as GroupDropPlanState<T> | undefined;
	if (!state) {
		state = createEmptyGroupDropPlanState<T>();
		session.private.set(SORTABLE_GROUP_DROP_PLAN_KEY, state);
	}
	return state;
}

export function getGroupDropPlan<T>(session: DragSession): GroupDropPlan<T> {
	return getGroupDropPlanState<T>(session).plan;
}

export function getGroupedStickyTargetId(session: DragSession): symbol | null {
	return getGroupDropPlanState(session).stickyTargetId;
}

export function isGroupedDragSession(sessionData: unknown): boolean {
	if (!SortableDragData.is(sessionData)) return false;
	const sourceId = sessionData.sortableId;
	if (!sourceId) return false;
	const source = sortableRegistry.get(sourceId);
	return Boolean(source?.opts.group);
}

export function shouldDeferGroupedContainerDrop<T>(
	ctx: SortableContext<T>,
	sessionData: unknown,
): boolean {
	if (!isGroupedDragSession(sessionData) || !SortableDragData.is(sessionData)) return false;
	const sourceId = sessionData.sortableId!;
	const source = sortableRegistry.get<T>(sourceId);
	if (!source?.opts.group) return false;
	if (ctx.id === sourceId) return true;
	if (isForeignDrag(ctx, sessionData)) return true;
	return false;
}

export function isGroupedForeignDropPending<T>(
	sourceCtx: SortableContext<T>,
	session: DragSession | null,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): boolean {
	if (!sourceCtx.opts.group) return false;
	const plan = session ? getGroupDropPlan(session) : { kind: 'none' as const };
	if (plan.kind === 'transfer') return true;
	return pickBestForeignTarget(sourceCtx, dragKey, pointerX, pointerY) != null;
}

function findForeignTargetByContainerPointer<T>(
	sourceCtx: SortableContext<T>,
	pointerX: number,
	pointerY: number,
): SortableContext<T> | null {
	const group = sourceCtx.opts.group;
	if (!group) return null;
	for (const targetCtx of sortableRegistry.values()) {
		if (targetCtx.id === sourceCtx.id) continue;
		if (targetCtx.opts.group !== group) continue;
		if (!pointerInForeignColumnContainer(targetCtx, pointerX, pointerY)) continue;
		return targetCtx as SortableContext<T>;
	}
	return null;
}

function resolveTransferTarget<T>(
	sourceCtx: SortableContext<T>,
	state: GroupDropPlanState<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): SortableContext<T> | null {
	let targetCtx = pickBestForeignTarget(sourceCtx, dragKey, pointerX, pointerY);
	if (targetCtx) {
		state.stickyTargetId = targetCtx.id;
		return targetCtx;
	}
	targetCtx = findForeignTargetByContainerPointer(sourceCtx, pointerX, pointerY);
	if (targetCtx) {
		state.stickyTargetId = targetCtx.id;
		return targetCtx;
	}
	if (state.stickyTargetId) {
		targetCtx = sortableRegistry.get<T>(state.stickyTargetId) ?? null;
		if (
			targetCtx &&
			pointerInForeignColumnContainer(targetCtx, pointerX, pointerY)
		) {
			return targetCtx;
		}
		state.stickyTargetId = null;
	}
	if (!Number.isNaN(sourceCtx.lastIntentX)) {
		targetCtx = pickBestForeignTarget(
			sourceCtx,
			dragKey,
			sourceCtx.lastIntentX,
			sourceCtx.lastIntentY,
		);
		if (targetCtx) {
			state.stickyTargetId = targetCtx.id;
			return targetCtx;
		}
	}
	state.stickyTargetId = null;
	return null;
}

export function updateGroupDropPlan<T>(
	session: DragSession,
	sourceCtx: SortableContext<T>,
	dragKey: string,
	pointerX: number,
	pointerY: number,
	sessionData: unknown,
): void {
	if (!sourceCtx.opts.group || !SortableDragData.is(sessionData)) return;
	if (sessionData.sortableId !== sourceCtx.id) return;

	const state = getGroupDropPlanState<T>(session);
	state.lastPointerX = pointerX;
	state.lastPointerY = pointerY;

	const sourceId = sourceCtx.id;
	const sourceItems = [...sourceCtx.opts.items()];
	const from = sourceItems.findIndex((i) => sourceCtx.opts.keyBy(i) === dragKey);
	if (from < 0) {
		state.plan = { kind: 'none' };
		syncTransferPreview(state);
		return;
	}

	const targetCtx = resolveTransferTarget(sourceCtx, state, dragKey, pointerX, pointerY);
	if (targetCtx) {
		const to = resolveForeignInsertAt(targetCtx, pointerX, pointerY, dragKey);
		state.plan = {
			kind: 'transfer',
			sourceId,
			targetId: targetCtx.id,
			item: sourceItems[from]!,
			from,
			to,
		};
		syncTransferPreview(state);
		return;
	}

	state.stickyTargetId = null;
	const container = sourceCtx.containerNode;
	const previewMode = resolvePreviewMode(sourceCtx.opts);
	const overForeign =
		pickBestForeignTarget(sourceCtx, dragKey, pointerX, pointerY) != null;
	if (overForeign && previewMode === 'visual') {
		state.plan = { kind: 'none' };
		syncTransferPreview(state);
		return;
	}
	if (
		container &&
		!pointerInContainer(container, pointerX, pointerY, sourceCtx) &&
		previewMode === 'visual'
	) {
		state.plan = { kind: 'none' };
		syncTransferPreview(state);
		return;
	}

	const commit = commitFromIntent(sourceCtx, dragKey, pointerX, pointerY);
	if (commit) {
		state.plan = { kind: 'reorder', sourceId, commit };
		syncTransferPreview(state);
		return;
	}

	state.plan = { kind: 'none' };
	syncTransferPreview(state);
}

function transferPreviewKey<T>(plan: Extract<GroupDropPlan<T>, { kind: 'transfer' }>): string {
	return `${String(plan.targetId)}:${plan.to}`;
}

function emitTransferPreview<T>(
	plan: Extract<GroupDropPlan<T>, { kind: 'transfer' }>,
	phase: 'preview' | 'commit',
	toIndex = plan.to,
): void {
	const target = sortableRegistry.get<T>(plan.targetId);
	if (!target) return;
	const meta = {
		fromIndex: plan.from,
		toIndex,
		sourceId: plan.sourceId,
		phase,
	};
	if (target.opts.onTransfer) {
		target.opts.onTransfer(plan.item, meta);
		return;
	}
	if (phase !== 'commit') return;
	const source = sortableRegistry.get<T>(plan.sourceId);
	if (!source) return;
	const sourceItems = [...source.opts.items()];
	const sourceNext = sourceItems.filter((_, index) => index !== plan.from);
	const targetItems = [...target.opts.items()];
	targetItems.splice(plan.to, 0, plan.item);
	const mode = target.opts.mode ?? 'insert';
	source.opts.onReorder(sourceNext, {
		from: plan.from,
		to: plan.from,
		item: plan.item,
		mode,
		phase: 'commit',
	});
	target.opts.onReorder(targetItems, {
		from: plan.from,
		to: plan.to,
		item: plan.item,
		mode,
		phase: 'commit',
	});
}

function syncTransferPreview<T>(state: GroupDropPlanState<T>): void {
	const plan = state.plan;
	const prev = state.transferPreviewPlan;
	const nextKey =
		plan.kind === 'transfer' ? transferPreviewKey(plan) : null;
	const prevKey = prev ? transferPreviewKey(prev) : null;
	if (nextKey === prevKey) return;

	if (prev) {
		emitTransferPreview(prev, 'preview', -1);
	}

	if (plan.kind === 'transfer') {
		emitTransferPreview(plan, 'preview');
		state.transferPreviewPlan = plan;
	} else {
		state.transferPreviewPlan = null;
	}
}

function refreshPlanAtPointer<T>(
	session: DragSession,
	sessionData: unknown,
	dragKey: string,
	pointerX: number,
	pointerY: number,
): void {
	if (!SortableDragData.is(sessionData)) return;
	const sourceId = sessionData.sortableId;
	if (!sourceId) return;
	const source = sortableRegistry.get<T>(sourceId);
	if (!source?.opts.group) return;
	updateGroupDropPlan(session, source, dragKey, pointerX, pointerY, sessionData);
}

function pointerSamplesForFinalize(
	sessionData: unknown,
	pointerX: number,
	pointerY: number,
): { x: number; y: number }[] {
	const release = { x: pointerX, y: pointerY };
	const samples = engineExtensions.runDropPointerSamples({ sessionData, pointerX, pointerY });
	if (!samples?.length) return [release];
	const rest = samples.filter((pt) => pt.x !== release.x || pt.y !== release.y);
	return [...rest, release];
}

function commitGroupDropPlanNow<T>(
	session: DragSession,
	plan: GroupDropPlan<T>,
	dragKey: string,
): boolean {
	switch (plan.kind) {
		case 'none':
			return false;
		case 'transfer': {
			const source = sortableRegistry.get<T>(plan.sourceId);
			const target = sortableRegistry.get<T>(plan.targetId);
			if (!source || !target) return false;
			const targetOpts = target.opts as SortableOptions<T>;
			clearSortableVisualPreview(source);
			clearForeignSortablePreview(target);
			if (targetOpts.onTransfer) {
				emitTransferPreview(plan, 'commit');
			} else {
				const sourceItems = [...source.opts.items()];
				const sourceNext = sourceItems.filter((_, index) => index !== plan.from);
				const targetItems = [...target.opts.items()];
				targetItems.splice(plan.to, 0, plan.item);
				const mode = target.opts.mode ?? 'insert';
				source.opts.onReorder(sourceNext, {
					from: plan.from,
					to: plan.from,
					item: plan.item,
					mode,
					phase: 'commit',
				});
				target.opts.onReorder(targetItems, {
					from: plan.from,
					to: plan.to,
					item: plan.item,
					mode,
					phase: 'commit',
				});
			}
			invalidateMidsCache(source);
			invalidateMidsCache(target);
			clearIntentSession(source);
			clearIntentSession(target);
			return true;
		}
		case 'reorder': {
			const source = sortableRegistry.get<T>(plan.sourceId);
			if (!source) return false;
			const { commit } = plan;
			invalidateMidsCache(source);
			source.opts.onReorder(commit.next, {
				from: commit.from,
				to: commit.insertAt,
				item: commit.item,
				mode: source.opts.mode ?? 'insert',
				phase: 'commit',
			});
			clearIntentSession(source);
			return true;
		}
	}
}

export function applyGroupDropPlan<T>(
	session: DragSession,
	plan: GroupDropPlan<T>,
	dragKey: string,
): boolean {
	if (plan.kind === 'none') return false;
	const sourceId = plan.kind === 'transfer' ? plan.sourceId : plan.sourceId;
	const source = sortableRegistry.get<T>(sourceId);
	if (!source) return false;
	if (resolvePreviewMode(source.opts) === 'visual') {
		session.private.set(SORTABLE_PENDING_GROUP_COMMIT_KEY, plan);
		return true;
	}
	return commitGroupDropPlanNow(session, plan, dragKey);
}

export function flushPendingGroupDropCommit<T>(session: DragSession): boolean {
	const plan = session.private.get(SORTABLE_PENDING_GROUP_COMMIT_KEY) as
		| GroupDropPlan<T>
		| undefined;
	if (!plan || plan.kind === 'none') return false;
	session.private.delete(SORTABLE_PENDING_GROUP_COMMIT_KEY);
	const dragKey = SortableDragData.key(session.data) ?? '';
	return commitGroupDropPlanNow(session, plan, dragKey);
}

export function finalizeGroupDropPlan(
	dragCtx: DragCtx,
	activeDragKey: string,
): GroupDropFinalizeResult {
	const none: GroupDropFinalizeResult = {
		handled: false,
		needsVisualRelease: false,
		dragKey: activeDragKey,
	};
	const session = dragCtx.session;
	const sessionData = session.data;
	if (!isGroupedDragSession(sessionData)) return none;
	if (session.private.get(SORTABLE_GROUP_DROP_HANDLED_KEY)) {
		return { handled: true, needsVisualRelease: false, dragKey: activeDragKey };
	}

	const dragKey = SortableDragData.key(sessionData) || activeDragKey;
	if (dragKey !== activeDragKey) return none;

	const pointerX = dragCtx.lastInput?.clientX ?? session.pointer.x;
	const pointerY = dragCtx.lastInput?.clientY ?? session.pointer.y;

	const sourceId = SortableDragData.sourceId(sessionData);
	const source = sourceId ? sortableRegistry.get<T>(sourceId) : undefined;
	const container = source?.containerNode;
	const inSource =
		source &&
		container instanceof HTMLElement &&
		pointerInContainer(container, pointerX, pointerY, source);
	const overForeignAtRelease =
		source != null &&
		isGroupedForeignDropPending(source, session, dragKey, pointerX, pointerY);

	let plan: GroupDropPlan<T>;
	if (inSource && !overForeignAtRelease) {
		refreshPlanAtPointer(session, sessionData, dragKey, pointerX, pointerY);
		plan = getGroupDropPlan<T>(session);
	} else {
		plan = getGroupDropPlan<T>(session);
		for (const pt of pointerSamplesForFinalize(sessionData, pointerX, pointerY)) {
			refreshPlanAtPointer(session, sessionData, dragKey, pt.x, pt.y);
			const next = getGroupDropPlan<T>(session);
			if (next.kind === 'transfer') {
				plan = next;
			} else if (plan.kind !== 'transfer' && next.kind === 'reorder') {
				plan = next;
			}
		}
		refreshPlanAtPointer(session, sessionData, dragKey, pointerX, pointerY);
		const releasePlan = getGroupDropPlan<T>(session);
		if (releasePlan.kind === 'transfer') {
			plan = releasePlan;
		} else if (releasePlan.kind === 'reorder' && plan.kind !== 'transfer') {
			plan = releasePlan;
		}
	}
	if (plan.kind === 'none') return none;

	const planSource = sortableRegistry.get(plan.sourceId);
	if (!planSource) return none;

	const applied = applyGroupDropPlan(session, plan, dragKey);
	if (!applied) return none;

	session.private.set(SORTABLE_GROUP_DROP_HANDLED_KEY, true);
	const needsVisualRelease = resolvePreviewMode(planSource.opts) === 'visual';
	return { handled: true, needsVisualRelease, dragKey };
}
