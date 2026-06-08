import { clearDragTransform } from '../apply-transform.ts';
import { engineExtensions } from '../engine/extension-registry.ts';
import type { DropInstance } from '../instance.ts';
import {
	SORTABLE_DROP_KEY,
	SORTABLE_VISUAL_RELEASE_DONE_KEY,
	SORTABLE_VISUAL_RELEASE_KEY,
} from '../sortable-keys.ts';
import { sortableRegistry } from './context.ts';
import { sortableDraggedNodeRect, sortableDragPointer } from './intent.ts';
import { pickBestForeignTarget } from './intent/foreign-proximity.ts';
import { sortableNodeLayout } from './node-layout.ts';
import { SortableDragData } from './session-data.ts';

const SORTABLE_KEY_ATTR = 'data-sortable-key';

export class SortableEngineExtensions {
	static #installed = false;

	static ensureInstalled(): void {
		if (SortableEngineExtensions.#installed) return;
		SortableEngineExtensions.#installed = true;
		engineExtensions.register({
			onPointerDown({ inst, node }) {
				if (!(node instanceof HTMLElement) || !node.hasAttribute(SORTABLE_KEY_ATTR)) return;
				inst.offsetX = 0;
				inst.offsetY = 0;
				inst.proposedX = 0;
				inst.proposedY = 0;
				clearDragTransform(node);
				sortableNodeLayout.clearVisualTransformsForNode(node);
			},

			onFinish({ inst, wasDragging }) {
				const visualRelease = inst.dragCtx.session.private.get(SORTABLE_VISUAL_RELEASE_KEY);
				if (!(visualRelease instanceof Promise)) return;
				return visualRelease.finally(() => {
					if (!wasDragging) return;
					const onVisualReleaseEnd = inst.dragCtx.session.private.get(
						SORTABLE_VISUAL_RELEASE_DONE_KEY,
					);
					if (onVisualReleaseEnd) {
						inst.dragCtx.session.private.delete(SORTABLE_VISUAL_RELEASE_DONE_KEY);
						onVisualReleaseEnd();
					}
				});
			},

			dropPointerSamples({ sessionData, pointerX, pointerY }) {
				const sourceSortableId = SortableDragData.sourceId(sessionData);
				const dragKey = SortableDragData.key(sessionData);
				if (!sourceSortableId || !dragKey) return null;
				const source = sortableRegistry.get(sourceSortableId);
				if (!source) return null;
				const dragRect = sortableDraggedNodeRect(source, dragKey);
				if (!dragRect) return [{ x: pointerX, y: pointerY }];
				const dragPoint = sortableDragPointer(source, dragKey, pointerX, pointerY);
				const samples = [
					{ x: pointerX, y: pointerY },
					{ x: dragPoint.x, y: dragPoint.y },
					{ x: dragRect.right, y: dragPoint.y },
					{ x: dragRect.left, y: dragPoint.y },
				];
				const seen = new Set<string>();
				return samples.filter((pt) => {
					const key = `${pt.x},${pt.y}`;
					if (seen.has(key)) return false;
					seen.add(key);
					return true;
				});
			},

			filterDropCandidates({ candidates, sessionData, x, y, pickBest }) {
				const sourceSortableId = SortableDragData.sourceId(sessionData);
				if (!sourceSortableId) return null;
				const dragKey = SortableDragData.key(sessionData);
				const source = sortableRegistry.get(sourceSortableId);
				if (source && dragKey) {
					const pt = sortableDragPointer(source, dragKey, x, y);
					x = pt.x;
					y = pt.y;
				}
				const foreign = candidates.filter(
					(drop) =>
						drop.sortableContainerId && drop.sortableContainerId !== sourceSortableId,
				);
				if (!foreign.length) return null;
				const bestForeign = pickBestForeignTarget(source, dragKey, x, y);
				const pool = bestForeign
					? foreign.filter((drop) => drop.sortableContainerId === bestForeign.id)
					: foreign;
				return pickBest(pool.length ? pool : foreign, x, y);
			},

			onDropPluginInit({ inst, plugin, state }) {
				SortableEngineExtensions.applyDropInstanceInit(inst, plugin, state);
			},

			onDropPluginDestroy({ inst, plugin }) {
				if (plugin.key === SORTABLE_DROP_KEY) inst.sortableContainerId = undefined;
			},

			onNodeLayoutChange: (node) => sortableNodeLayout.invalidateForNode(node),
		});
	}

	static applyDropInstanceInit(inst: DropInstance, plugin: { key: symbol }, state: unknown): void {
		if (plugin.key !== SORTABLE_DROP_KEY) return;
		const id = SortableDragData.containerIdFromState(state);
		if (id) inst.sortableContainerId = id;
	}
}

export function ensureSortableEngineExtensions(): void {
	SortableEngineExtensions.ensureInstalled();
}

export function applySortableDropInstanceInit(inst: DropInstance, state: unknown): void {
	SortableEngineExtensions.applyDropInstanceInit(inst, { key: SORTABLE_DROP_KEY }, state);
}
