import { describe, expect, it } from 'vitest';
import { computeDisplacements } from '../../src/sortable/displacement/index.ts';
import { IntentSession } from '../../src/sortable/context.ts';
import type { SortableIntentPluginState } from '../../src/sortable/context.ts';

describe('foreign insert displacement', () => {
	it('shifts siblings when dragFrom is virtual append index', () => {
		const entries = [
			{ key: 'cake', index: 0, start: 392, end: 464, size: 72 },
		];
		const state: SortableIntentPluginState = {
			preLayout: entries,
			currentLayout: entries,
			measuredRects: [],
			displacedKeys: [],
		};
		const ctx = {
			intent: new IntentSession({
				snapshot: [{ id: 'cake' }],
				dragFrom: 1,
				previewTo: 0,
				mids: null,
				dragAxis: null,
				dragBand: 0,
				targetIndex: 0,
				edgeThresholdPx: 0,
				slotBoundaries: null,
				sessionStrategy: 'horizontal',
				sessionPreset: 'horizontal',
				layoutStrategy: 'horizontal',
				containerRect: null,
				foreignInsertSize: 72,
			}),
			opts: { strategy: 'horizontal' },
			nodesByKey: new Map(),
		};

		const byKey = computeDisplacements(ctx as never, state, 'latte');
		const shift = byKey.get('cake');
		expect(shift?.x).toBeGreaterThan(0);
	});
});
