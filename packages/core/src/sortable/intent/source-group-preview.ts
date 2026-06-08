import { fmtOrder, sortableStory } from '../agent-log.ts';
import {
	applyDisplacements,
	clearDisplacements,
	clearTransformOnNode,
} from '../displacement/apply.ts';
import {
	computeSourceRemovedDisplacements,
	freezeSessionPreset,
	refreshSortableDisplacement,
} from '../displacement/refresh.ts';
import type { SortableContext } from '../context.ts';
import type { SortableOptions, SortablePreviewMode } from '../types.ts';
import { buildLayoutEntries } from '../visual/layout.ts';
import { listAxisForPreset, resolveStrategyInput } from '../strategy/resolve.ts';

function resolvePreviewMode<T>(opts: SortableOptions<T>): SortablePreviewMode {
	return opts.preview ?? 'visual';
}

function pauseSourceVisualPreview<T>(sourceCtx: SortableContext<T>, dragKey: string): void {
	if (resolvePreviewMode(sourceCtx.opts) !== 'visual') return;
	const intent = sourceCtx.intent;
	const visual = sourceCtx.intentVisual;
	if (!intent || !visual) return;
	const hadPreview = intent.previewTo !== intent.dragFrom;
	intent.previewTo = intent.dragFrom;
	clearDisplacements(sourceCtx.nodesByKey, visual.displacedKeys, { instant: true });
	for (const item of intent.snapshot) {
		const key = sourceCtx.opts.keyBy(item);
		if (key === dragKey) continue;
		const node = sourceCtx.nodesByKey.get(key);
		if (node instanceof HTMLElement) clearTransformOnNode(node, { instant: true });
	}
	visual.displacedKeys = [];
	// #region agent log
	const keys = intent.snapshot.map((item) => sourceCtx.opts.keyBy(item));
	sortableStory('F', 'intent/source-group-preview.ts', `source column frozen · ${dragKey}`, () => ({
		story: [
			`While hovering a friend column, the home list for "${dragKey}" must not keep shuffling its own chips.`,
			hadPreview
				? `Source preview was active; reset to home index ${intent.dragFrom} and cleared sibling nudges.`
				: `Source already at home index ${intent.dragFrom} (e.g. lone chip on Sam); refreshed displacement anyway.`,
			`Home order ${fmtOrder(keys, intent.dragFrom, dragKey)}.`,
		].join(' '),
		data: { dragKey, dragFrom: intent.dragFrom, hadPreview, homeKeys: keys },
	}));
	// #endregion
}

function reflowSourceVisualPreview<T>(sourceCtx: SortableContext<T>, dragKey: string): void {
	if (resolvePreviewMode(sourceCtx.opts) !== 'visual') return;
	const intent = sourceCtx.intent;
	const visual = sourceCtx.intentVisual;
	if (!intent || !visual) return;
	const strategyInput = resolveStrategyInput(sourceCtx.opts.strategy);
	const preset = freezeSessionPreset(strategyInput);
	const listAxis = listAxisForPreset(preset) ?? 'horizontal';
	const layoutEntries =
		visual.preLayout.length > 0
			? visual.preLayout
			: buildLayoutEntries(
					intent.snapshot,
					sourceCtx.opts.keyBy,
					sourceCtx.nodesByKey,
					listAxis,
				);
	clearDisplacements(sourceCtx.nodesByKey, visual.displacedKeys, { instant: true });
	const byKey = computeSourceRemovedDisplacements(layoutEntries, dragKey, listAxis);
	const applied = applyDisplacements(sourceCtx.nodesByKey, byKey, {
		instant: true,
		dragKey,
	});
	visual.displacedKeys = [...applied];
	// #region agent log
	const keys = intent.snapshot.map((item) => sourceCtx.opts.keyBy(item));
	sortableStory('F', 'intent/source-group-preview.ts', `source column reflow · ${dragKey}`, () => ({
		story: [
			`While hovering a friend column, the home list for "${dragKey}" closes its gap as if the chip were removed.`,
			`Remaining chips ${fmtOrder(keys.filter((k) => k !== dragKey), keys.length, dragKey)}.`,
		].join(' '),
		data: { dragKey, dragFrom: intent.dragFrom, homeKeys: keys, displacedKeys: [...applied] },
	}));
	// #endregion
}

export function syncSourceGroupPreview<T>(sourceCtx: SortableContext<T>, dragKey: string): void {
	const mode = sourceCtx.opts.groupSourcePreview ?? 'freeze';
	if (mode === 'reflow') reflowSourceVisualPreview(sourceCtx, dragKey);
	else pauseSourceVisualPreview(sourceCtx, dragKey);
}
