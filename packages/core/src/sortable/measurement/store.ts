import { buildLayoutEntries, type SortableLayoutEntry } from '../visual/layout.ts';
import type { SortablePreset } from '../strategy/types.ts';
import { layoutEntryToRect, rectsFromLayout, type MeasuredRect } from '../strategy/types.ts';

export type LayoutSnapshot = {
	entries: SortableLayoutEntry[];
	rects: MeasuredRect[];
};

export function measureDomRects(
	items: readonly { key: string }[],
	nodesByKey: Map<string, HTMLElement | SVGElement>,
): MeasuredRect[] {
	const rects: MeasuredRect[] = [];
	for (const { key } of items) {
		const el = nodesByKey.get(key);
		if (!(el instanceof HTMLElement)) {
			rects.push({ left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 });
			continue;
		}
		const r = el.getBoundingClientRect();
		rects.push({
			left: r.left,
			top: r.top,
			width: r.width,
			height: r.height,
			right: r.right,
			bottom: r.bottom,
		});
	}
	return rects;
}

export function snapshotLayout<T>(
	items: readonly T[],
	keyBy: (item: T) => string,
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	preset: SortablePreset,
): LayoutSnapshot {
	const listAxis = preset === 'grid' ? 'horizontal' : preset;
	const entries = buildLayoutEntries(items, keyBy, nodesByKey, listAxis);
	const rects =
		preset === 'grid'
			? measureDomRects(
					items.map((item) => ({ key: keyBy(item) })),
					nodesByKey,
				)
			: rectsFromLayout(entries, listAxis);
	return { entries, rects };
}

export function remeasureLayout<T>(
	items: readonly T[],
	keyBy: (item: T) => string,
	nodesByKey: Map<string, HTMLElement | SVGElement>,
	preset: SortablePreset,
): LayoutSnapshot {
	return snapshotLayout(items, keyBy, nodesByKey, preset);
}

export function entryRect(entry: SortableLayoutEntry, preset: SortablePreset): MeasuredRect {
	const axis = preset === 'vertical' ? 'vertical' : 'horizontal';
	return layoutEntryToRect(entry, axis);
}
