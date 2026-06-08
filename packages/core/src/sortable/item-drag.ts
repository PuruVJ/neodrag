import { dragData } from '../plugins.ts';
import { resolvePluginList } from '../resolve-plugins.ts';
import {
	SORTABLE_VISUAL_RELEASE_DONE_KEY,
	SORTABLE_VISUAL_RELEASE_KEY,
} from '../sortable-keys.ts';
import {
	defineDragPlugin,
	type DragPlugin,
	type DragPluginList,
} from '../types.ts';
import { IntentSession, type SortableContext, type SortableIntentPluginState } from './context.ts';
import {
	clearGroupedForeignSortablePreviews,
	syncForeignSortableIntents,
} from './intent/foreign.ts';
import { clearGroupedSourceElevation } from './visual/elevation.ts';
import {
	commitFromIntent,
	edgeThresholdForIntent,
	layoutStrategyFromNodes,
	pointerInContainer,
	resolvePreviewMode,
	resolveStrategy,
	updateSortableIntent,
} from './intent.ts';
import {
	finalizeGroupDropPlan,
	isGroupedDragSession,
	isGroupedForeignDropPending,
	resetGroupDropPlan,
} from './group/plan.ts';
import { clearDragTransform } from '../apply-transform.ts';
import { clearSortableVisualPreview } from './displacement/cleanup.ts';
import { clearTransformOnNode } from './displacement/apply.ts';
import { sortableNodeLayout } from './node-layout.ts';
import { freezeSessionPreset, refreshSortableDisplacement } from './displacement/refresh.ts';
import { snapshotLayout } from './measurement/store.ts';
import { buildMidsFromLayout, invalidateMidsCache } from './mids.ts';
import { applySortableReorder } from './reorder.ts';
import { runVisualDropRelease } from './release.ts';
import { resolveStrategyInput } from './strategy/resolve.ts';
import { SortableDragData } from './session-data.ts';
import type { SortableOptions } from './types.ts';
import {
	midsFromLayoutEntries,
	resetSortableChipDragStyles,
	slotBoundariesFromMids,
} from './visual.ts';

export function createSortableItemPlugins<T>(
	ctx: SortableContext<T>,
	opts: SortableOptions<T>,
	key: string,
	itemKeys: Map<string, symbol>,
	itemKey: (id: string) => symbol,
	data?: () => T,
): DragPluginList {
	const plugins: DragPlugin[] = [
		defineDragPlugin(() => ({
			key: itemKey(key),
			phase: 'pre',

			init(dragCtx) {
				dragCtx.rootNode.setAttribute('data-sortable-key', key);
				ctx.nodesByKey.set(key, dragCtx.rootNode);
			},

			destroy(dragCtx) {
				ctx.nodesByKey.delete(key);
				itemKeys.delete(key);
				invalidateMidsCache(ctx);
				dragCtx.rootNode.removeAttribute('data-sortable-key');
			},
		}))(),
	];

	plugins.unshift(dragData(() => dragPayload(ctx, key, data)));

	plugins.push(
		defineDragPlugin(() => ({
			key: Symbol(`neodrag.sortable.intent.${key}`),
			phase: 'resolve',

			init() {
				return {
					preLayout: [],
					currentLayout: [],
					measuredRects: [],
					displacedKeys: [],
				} satisfies SortableIntentPluginState;
			},

			start(dragCtx, state) {
				const sessionData = dragCtx.session.data;
				const dragKey = SortableDragData.key(sessionData);
				if (dragKey === key) {
					resetGroupDropPlan(dragCtx.session);
				}

				const snapshot = [...ctx.opts.items()];
				const dragFrom = snapshot.findIndex((i) => ctx.opts.keyBy(i) === key);
				const strategyInput = resolveStrategyInput(ctx.opts.strategy);
				const sessionPreset = freezeSessionPreset(strategyInput);
				const strategy = resolveStrategy(ctx.opts.strategy);
				const layoutKeys = snapshot.map((item) => ctx.opts.keyBy(item));
				const layoutAtStart = layoutStrategyFromNodes(ctx, layoutKeys);
				const listStrategy = sessionPreset === 'grid' ? 'horizontal' : strategy;

				ctx.intent = new IntentSession({
					snapshot,
					dragFrom,
					previewTo: dragFrom,
					mids: null,
					dragAxis: null,
					dragBand: 0,
					targetIndex: dragFrom,
					edgeThresholdPx: NaN,
					slotBoundaries: null,
					sessionStrategy: strategy,
					sessionPreset,
					layoutStrategy: layoutAtStart ?? strategy,
					containerRect: null,
				});

				ctx.intentVisual = state;
				ctx.intentVisualKey = key;

				if (resolvePreviewMode(ctx.opts) !== 'visual') {
					ctx.intent.mids = buildMidsFromLayout(ctx, snapshot, listStrategy);
					return;
				}

				const container = ctx.containerNode;
				const node = dragCtx.rootNode;
				if (!(container instanceof HTMLElement) || !(node instanceof HTMLElement)) {
					ctx.intent.mids = buildMidsFromLayout(ctx, snapshot, listStrategy);
					ctx.intent.slotBoundaries = ctx.intent.mids
						? slotBoundariesFromMids(ctx.intent.mids)
						: null;
					return;
				}

				for (const el of ctx.nodesByKey.values()) {
					if (el instanceof HTMLElement) resetSortableChipDragStyles(el);
				}
				for (const el of ctx.nodesByKey.values()) {
					if (el instanceof HTMLElement) clearTransformOnNode(el, { instant: true });
				}

				const measured = layoutStrategyFromNodes(ctx, layoutKeys);
				if (measured) ctx.intent.layoutStrategy = measured;

				const layout = snapshotLayout(snapshot, ctx.opts.keyBy, ctx.nodesByKey, sessionPreset);
				state.preLayout = layout.entries;
				state.currentLayout = layout.entries;
				state.measuredRects = layout.rects;

				const dragEntry = state.preLayout.find((entry) => entry.key === key);
				if (dragEntry) {
					ctx.intent.dragAxis = { start: dragEntry.start, end: dragEntry.end };
					ctx.intent.dragBand = Math.max(12, dragEntry.size * 0.25);
				}
				ctx.intent.mids = midsFromLayoutEntries(state.preLayout);
				ctx.intent.slotBoundaries = slotBoundariesFromMids(ctx.intent.mids);
				ctx.intent.sessionStrategy = strategy;
				ctx.intent.sessionPreset = sessionPreset;
				ctx.intent.targetIndex = ctx.intent.dragFrom;
				ctx.intent.edgeThresholdPx = edgeThresholdForIntent(
					ctx,
					listStrategy,
					ctx.intent.mids,
					key,
				);
				ctx.intent.containerRect = container.getBoundingClientRect();
				container.setAttribute('data-sortable-dragging', '');
				state.displacedKeys = [];
				refreshSortableDisplacement(ctx, key, state, { instant: true });
			},

			drag(dragCtx, _state, input) {
				const sessionData = dragCtx.session.data;
				const dragKey = SortableDragData.key(sessionData);
				if (dragKey !== key) return;
				if (ctx.opts.group && SortableDragData.is(sessionData) && sessionData.sortableId !== ctx.id) {
					return;
				}
				const x = input.clientX;
				const y = input.clientY;
				if (x === ctx.lastIntentX && y === ctx.lastIntentY) return;
				ctx.lastIntentX = x;
				ctx.lastIntentY = y;
				const session = dragCtx.session;
				updateSortableIntent(ctx, dragKey, x, y, sessionData, session);
				syncForeignSortableIntents(ctx, dragKey, x, y, sessionData, session);
			},

			end(dragCtx, state, input, reason) {
				const sessionData = dragCtx.session.data;
				const dragKey = SortableDragData.key(sessionData);
				if (dragKey !== key) return;
				if (
					ctx.opts.group &&
					SortableDragData.is(sessionData) &&
					sessionData.sortableId !== ctx.id
				) {
					return;
				}

				if (
					reason === 'cancel' &&
					resolvePreviewMode(ctx.opts) === 'state' &&
					ctx.intent
				) {
					const snapshot = ctx.intent.snapshot;
					const mode = ctx.opts.mode ?? 'insert';
					ctx.opts.onSortPreview?.(snapshot, {
						from: -1,
						to: -1,
						item: snapshot[0]!,
						mode,
					});
				}

				const previewMode = resolvePreviewMode(ctx.opts);
				const endX = input?.clientX ?? ctx.lastIntentX;
				const endY = input?.clientY ?? ctx.lastIntentY;
				const session = dragCtx.session;
				const overForeignColumn = isGroupedForeignDropPending(
					ctx,
					session,
					dragKey,
					endX,
					endY,
				);

				const finalized = finalizeGroupDropPlan(dragCtx, key);
				clearGroupedForeignSortablePreviews(ctx, key);
				clearGroupedSourceElevation(ctx, key);

				const dragRoot = dragCtx.rootNode;
				const resetDragNodeStyles = () => {
					if (!(dragRoot instanceof HTMLElement)) return;
					clearDragTransform(dragRoot);
					sortableNodeLayout.clearVisualTransformsForNode(dragRoot);
				};

				if (finalized.handled) {
					if (!finalized.needsVisualRelease) {
						resetDragNodeStyles();
						clearSortableVisualPreview(ctx, { instant: true });
						state.displacedKeys = [];
					}
					if (finalized.needsVisualRelease) {
						const release = runVisualDropRelease(ctx, dragKey, state, dragCtx);
						dragCtx.session.private.set(SORTABLE_VISUAL_RELEASE_KEY, release);
						if (ctx.opts.onVisualReleaseEnd) {
							dragCtx.session.private.set(
								SORTABLE_VISUAL_RELEASE_DONE_KEY,
								ctx.opts.onVisualReleaseEnd,
							);
						}
						ctx.intentVisual = null;
						ctx.intentVisualKey = null;
						return;
					}
					ctx.intentVisual = null;
					ctx.intentVisualKey = null;
					ctx.clearIntent();
					return;
				}

				let visualDropEnd = false;
				if (
					previewMode === 'visual' &&
					!isGroupedDragSession(sessionData) &&
					!overForeignColumn &&
					ctx.intent &&
					ctx.intent.previewTo >= 0 &&
					ctx.intent.previewTo !== ctx.intent.dragFrom
				) {
					const sourceContainer = ctx.containerNode;
					const inSourceContainer =
						!(sourceContainer instanceof HTMLElement) ||
						pointerInContainer(sourceContainer, ctx.lastIntentX, ctx.lastIntentY, ctx);
					if (inSourceContainer) {
						const commit = commitFromIntent(
							ctx,
							dragKey,
							ctx.lastIntentX,
							ctx.lastIntentY,
						);
						if (commit) {
							invalidateMidsCache(ctx);
							clearSortableVisualPreview(ctx, { instant: true });
							state.displacedKeys = [];
							ctx.opts.onReorder(commit.next, {
								from: commit.from,
								to: commit.insertAt,
								item: commit.item,
								mode: ctx.opts.mode ?? 'insert',
								phase: 'commit',
							});
							visualDropEnd = true;
						}
					}
				}

				if (previewMode === 'visual' && visualDropEnd) {
					const release = runVisualDropRelease(ctx, dragKey, state, dragCtx);
					dragCtx.session.private.set(SORTABLE_VISUAL_RELEASE_KEY, release);
					if (ctx.opts.onVisualReleaseEnd) {
						dragCtx.session.private.set(
							SORTABLE_VISUAL_RELEASE_DONE_KEY,
							ctx.opts.onVisualReleaseEnd,
						);
					}
					ctx.intentVisual = null;
					ctx.intentVisualKey = null;
					return;
				}

				if (previewMode === 'visual') {
					const sourceContainer = ctx.containerNode;
					const inSourceContainer =
						!(sourceContainer instanceof HTMLElement) ||
						pointerInContainer(sourceContainer, ctx.lastIntentX, ctx.lastIntentY, ctx);
					if (overForeignColumn || !inSourceContainer) {
						clearSortableVisualPreview(ctx, { instant: true });
						state.displacedKeys = [];
						resetDragNodeStyles();
					}
					ctx.opts.onVisualReleaseEnd?.();
				}

				ctx.intentVisual = null;
				ctx.intentVisualKey = null;
				ctx.clearIntent();
			},
		}))(),
	);

	if (opts.keyboard) {
		plugins.push(...sortableKeyboardForItem(ctx, key));
	}

	if (opts.itemPlugins) {
		const item = [...opts.items()].find((i) => ctx.opts.keyBy(i) === key);
		const extra = opts.itemPlugins(key, item);
		if (extra.length) plugins.push(...resolvePluginList(extra));
	}

	return plugins;
}

function dragPayload<T>(ctx: SortableContext<T>, key: string, data?: () => T) {
	if (ctx.opts.group) {
		return data ? { key, sortableId: ctx.id, value: data() } : { key, sortableId: ctx.id };
	}
	return data ? { key, value: data() } : { key };
}

function sortableKeyboardForItem<T>(ctx: SortableContext<T>, key: string): DragPlugin[] {
	return [
		defineDragPlugin(() => ({
			key: Symbol(`neodrag.sortable.keyboard.${key}`),
			phase: 'pre',

			init(dragCtx) {
				const root = dragCtx.rootNode;
				const onKeydown = (e: KeyboardEvent) => {
					if (
						e.key !== 'ArrowUp' &&
						e.key !== 'ArrowDown' &&
						e.key !== 'ArrowLeft' &&
						e.key !== 'ArrowRight'
					)
						return;
					const strategy = resolveStrategy(ctx.opts.strategy);
					const horizontal = strategy === 'horizontal';
					if (horizontal && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
					if (!horizontal && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
					e.preventDefault();

					const items = [...ctx.opts.items()];
					const from = items.findIndex((i) => ctx.opts.keyBy(i) === key);
					if (from < 0) return;
					const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
					const to = from + delta;
					if (to < 0 || to >= items.length) return;
					const mode = ctx.opts.mode ?? 'insert';
					const { next, insertAt } = applySortableReorder(items, from, to, mode);
					invalidateMidsCache(ctx);
					ctx.opts.onReorder(next, {
						from,
						to: insertAt,
						item: items[from]!,
						mode,
						phase: 'commit',
					});
					root.focus();
				};

				root.addEventListener('keydown', onKeydown);
				if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');

				return { onKeydown };
			},

			destroy(dragCtx, state) {
				if (state?.onKeydown) dragCtx.rootNode.removeEventListener('keydown', state.onKeydown);
			},
		}))(),
	];
}
