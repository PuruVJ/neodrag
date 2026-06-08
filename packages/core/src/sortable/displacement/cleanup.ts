import { clearDragTransform } from '../../apply-transform.ts';
import { sortableChipsSnapshot, sortableStory } from '../agent-log.ts';
import type { SortableContext } from '../context.ts';
import { resetSortableChipDragStyles } from '../visual.ts';
import { clearAllDisplacements } from './apply.ts';

export function clearSortableVisualPreview<T>(
	ctx: SortableContext<T>,
	options: { instant?: boolean } = { instant: true },
): void {
	// #region agent log
	const teardownCaller = new Error('teardown').stack?.split('\n').slice(1, 4).join(' | ') ?? '';
	sortableStory('C', 'displacement/cleanup.ts', 'visual preview teardown · start', () => ({
		story: [
			'Drag ended or pointer left — clearing sortable visual preview.',
			ctx.intent
				? `Last intent dragFrom=${ctx.intent.dragFrom} previewTo=${ctx.intent.previewTo}.`
				: 'No intent session attached.',
			'Snapshotted chip transforms before reset.',
		].join(' '),
		data: {
			previewTo: ctx.intent?.previewTo,
			dragFrom: ctx.intent?.dragFrom,
			teardownCaller,
			before: sortableChipsSnapshot(ctx.nodesByKey),
		},
	}));
	// #endregion
	clearAllDisplacements(ctx.nodesByKey, options);
	for (const node of ctx.nodesByKey.values()) {
		if (!(node instanceof HTMLElement)) continue;
		clearDragTransform(node);
		resetSortableChipDragStyles(node);
	}
	if (ctx.intentVisual) ctx.intentVisual.displacedKeys = [];
	const container = ctx.containerNode;
	if (container instanceof HTMLElement) container.removeAttribute('data-sortable-dragging');
	// #region agent log
	sortableStory('C', 'displacement/cleanup.ts', 'visual preview teardown · done', () => ({
		story: 'All displacement transforms and drag styles cleared; chips should match DOM order.',
		data: { after: sortableChipsSnapshot(ctx.nodesByKey) },
	}));
	// #endregion
}
