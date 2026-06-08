import type { DropCtx } from '../types.ts';
import {
	clearIntentSession,
	type SortableCommit,
	type SortableContext,
	sortableRegistry,
} from './context.ts';
import { clearSortableVisualPreview } from './displacement/cleanup.ts';
import { clearForeignSortablePreview, resolveForeignInsertAt } from './intent/foreign.ts';
import { isGroupedForeignDropPending } from './group/plan.ts';
import {
	commitFromIntent,
	isForeignDrag,
	pointerInContainer,
	resolveIntentAt,
	resolvePreviewMode,
	resolveStrategy,
	updateSortableIntent,
} from './intent.ts';
import { computeIndex, computeIntentIndex, invalidateMidsCache } from './mids.ts';
import { applySortableReorder, reorderForInsert } from './reorder.ts';
import { SortableDragData } from './session-data.ts';
import type { SortableOptions } from './types.ts';
import {
	shouldDeferGroupedContainerDrop,
	isGroupedDragSession,
} from './group/plan.ts';

export type SortableDropRelease = 'immediate' | 'visual';

export type SortableDropResolution<T> =
	| { kind: 'none' }
	| { kind: 'blocked' }
	| { kind: 'transfer'; item: T; from: number; to: number; sourceId: symbol }
	| { kind: 'commit'; commit: SortableCommit<T>; release: SortableDropRelease };

export type ContainerDropStateInit = {
	sortableId: symbol;
	hoverIndex: number;
	dragKey: string;
	lastX: number;
	lastY: number;
	lastIndex: number;
};

export class ContainerDropState {
	sortableId: symbol;
	hoverIndex: number;
	dragKey: string;
	lastX: number;
	lastY: number;
	lastIndex: number;

	constructor(init: ContainerDropStateInit) {
		this.sortableId = init.sortableId;
		this.hoverIndex = init.hoverIndex;
		this.dragKey = init.dragKey;
		this.lastX = init.lastX;
		this.lastY = init.lastY;
		this.lastIndex = init.lastIndex;
	}
}

export class SortableDropCoordinator {
	resolve<T>(
		ctx: SortableContext<T>,
		opts: SortableOptions<T>,
		dropCtx: DropCtx,
		state: ContainerDropState,
		pointerX: number,
		pointerY: number,
	): SortableDropResolution<T> {
		const sessionData = dropCtx.session.data;
		const dragKey = SortableDragData.key(sessionData) || state.dragKey;
		const container = ctx.containerNode;

		if (shouldDeferGroupedContainerDrop(ctx, sessionData)) {
			return { kind: 'none' };
		}

		const sourceId = SortableDragData.sourceId(sessionData);
		const foreignDropPending =
			dragKey != null &&
			opts.group != null &&
			sourceId === ctx.id &&
			isGroupedForeignDropPending(ctx, dropCtx.session, dragKey, pointerX, pointerY);
		const overForeignColumn = foreignDropPending;
		const inContainer =
			!container || pointerInContainer(container, pointerX, pointerY, ctx);
		const visualPending =
			resolvePreviewMode(opts) === 'visual' &&
			ctx.intent &&
			ctx.intent.previewTo >= 0 &&
			ctx.intent.previewTo !== ctx.intent.dragFrom &&
			inContainer &&
			!overForeignColumn;
		if (dragKey && container && !inContainer && !visualPending) {
			return { kind: 'none' };
		}

		if (foreignDropPending) {
			return { kind: 'none' };
		}

		if (
			dragKey &&
			ctx.intent &&
			resolvePreviewMode(opts) !== 'visual' &&
			(pointerX !== ctx.lastIntentX || pointerY !== ctx.lastIntentY)
		) {
			updateSortableIntent(ctx, dragKey, pointerX, pointerY, sessionData, dropCtx.session);
		}

		if (isForeignDrag(ctx, sessionData) && dragKey && SortableDragData.is(sessionData)) {
			const sortableId = sessionData.sortableId!;
			const source = sortableRegistry.get<T>(sortableId);
			if (!source) return { kind: 'none' };
			const sourceItems = [...source.opts.items()];
			const from = sourceItems.findIndex((i) => source.opts.keyBy(i) === dragKey);
			if (from < 0) return { kind: 'none' };
			const input = dropCtx.lastInput;
			const x = input?.clientX ?? dropCtx.pointer.x;
			const y = input?.clientY ?? dropCtx.pointer.y;
			const to = resolveForeignInsertAt(ctx, x, y, dragKey);
			return { kind: 'transfer', item: sourceItems[from]!, from, to, sourceId: sortableId };
		}

		const commit = commitFromIntent(ctx, dragKey, pointerX, pointerY);
		if (commit) {
			const release: SortableDropRelease =
				resolvePreviewMode(opts) === 'visual' ? 'visual' : 'immediate';
			return { kind: 'commit', commit, release };
		}

		const legacy = this.#resolveLegacyDropCommit(
			ctx,
			opts,
			dragKey,
			pointerX,
			pointerY,
			dropCtx,
			state,
		);
		if (legacy) return { kind: 'commit', commit: legacy, release: 'immediate' };

		return { kind: 'none' };
	}

	apply<T>(
		ctx: SortableContext<T>,
		opts: SortableOptions<T>,
		resolution: SortableDropResolution<T>,
		dropCtx?: DropCtx,
	): void {
		if (dropCtx && isGroupedDragSession(dropCtx.session.data)) {
			return;
		}

		switch (resolution.kind) {
			case 'none':
			case 'blocked':
				return;
			case 'transfer': {
				const source = sortableRegistry.get<T>(resolution.sourceId);
				if (!source) return;
				if (opts.onTransfer) {
					clearForeignSortablePreview(ctx);
					opts.onTransfer(resolution.item, {
						fromIndex: resolution.from,
						toIndex: resolution.to,
						sourceId: resolution.sourceId,
						phase: 'commit',
					});
					invalidateMidsCache(ctx);
					invalidateMidsCache(source);
					clearIntentSession(source);
					clearIntentSession(ctx);
					return;
				}
				const sourceItems = [...source.opts.items()];
				const sourceNext = sourceItems.filter((_, index) => index !== resolution.from);
				const targetItems = [...opts.items()];
				targetItems.splice(resolution.to, 0, resolution.item);
				invalidateMidsCache(ctx);
				invalidateMidsCache(source);
				clearIntentSession(source);
				clearIntentSession(ctx);
				const mode = opts.mode ?? 'insert';
				source.opts.onReorder(sourceNext, {
					from: resolution.from,
					to: resolution.from,
					item: resolution.item,
					mode,
					phase: 'commit',
				});
				opts.onReorder(targetItems, {
					from: resolution.from,
					to: resolution.to,
					item: resolution.item,
					mode,
					phase: 'commit',
				});
				return;
			}
			case 'commit': {
				const { commit } = resolution;
				invalidateMidsCache(ctx);
				if (resolution.release === 'visual') {
					clearSortableVisualPreview(ctx);
				}
				opts.onReorder(commit.next, {
					from: commit.from,
					to: commit.insertAt,
					item: commit.item,
					mode: opts.mode ?? 'insert',
					phase: 'commit',
				});
				if (resolution.release === 'visual') {
					return;
				}
				clearIntentSession(ctx);
				return;
			}
		}
	}

	#resolveDropIndex<T>(
		ctx: SortableContext<T>,
		opts: SortableOptions<T>,
		dropCtx: DropCtx,
		state: ContainerDropState,
		dragKey: string,
	): number {
		if (!dragKey) return state.hoverIndex;
		invalidateMidsCache(ctx);
		const input = dropCtx.lastInput;
		const x = input?.clientX ?? dropCtx.pointer.x;
		const y = input?.clientY ?? dropCtx.pointer.y;
		const strategy = resolveStrategy(opts.strategy);
		if (resolvePreviewMode(opts) === 'visual' && ctx.intent) {
			return computeIntentIndex(ctx, x, y, strategy, dragKey);
		}
		return computeIndex(ctx, x, y, strategy, dragKey);
	}

	#resolveLegacyDropCommit<T>(
		ctx: SortableContext<T>,
		opts: SortableOptions<T>,
		dragKey: string,
		pointerX: number,
		pointerY: number,
		dropCtx: DropCtx,
		state: ContainerDropState,
	): SortableCommit<T> | null {
		if (!dragKey) return null;
		const items = [...opts.items()];
		const from = items.findIndex((i) => ctx.opts.keyBy(i) === dragKey);
		if (from < 0) return null;

		const mode = ctx.opts.mode ?? 'insert';
		let next: T[];
		let insertAt: number;

		if (resolvePreviewMode(opts) === 'visual' && ctx.intent) {
			const resolved = resolveIntentAt(ctx, pointerX, pointerY, dragKey, { commit: true });
			if (!resolved) return null;
			insertAt = resolved.insertAt;
			({ next } =
				mode === 'insert'
					? reorderForInsert(items, from, resolved.index, mode)
					: applySortableReorder(items, from, resolved.index, mode));
		} else {
			let to = this.#resolveDropIndex(ctx, opts, dropCtx, state, dragKey);
			if (to < 0) to = items.length - 1;
			({ next, insertAt } =
				mode === 'insert'
					? reorderForInsert(items, from, to, mode)
					: applySortableReorder(items, from, to, mode));
		}

		if (insertAt === from) return null;
		return { next, from, insertAt, item: items[from]! };
	}
}

export const sortableDrop = new SortableDropCoordinator();

export function resolveDropCommit<T>(
	ctx: SortableContext<T>,
	opts: SortableOptions<T>,
	dropCtx: DropCtx,
	state: ContainerDropState,
	pointerX: number,
	pointerY: number,
): SortableDropResolution<T> {
	return sortableDrop.resolve(ctx, opts, dropCtx, state, pointerX, pointerY);
}

export function applyDropResolution<T>(
	ctx: SortableContext<T>,
	opts: SortableOptions<T>,
	resolution: SortableDropResolution<T>,
	dropCtx?: DropCtx,
): void {
	sortableDrop.apply(ctx, opts, resolution, dropCtx);
}
