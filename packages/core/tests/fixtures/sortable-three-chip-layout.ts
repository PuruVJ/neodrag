import type { SortableLayoutEntry } from '../../src/sortable/visual.ts';

export const THREE_CHIP_PRE_LIFT: SortableLayoutEntry[] = [
	{ key: 'latte', index: 0, start: 277.6875, end: 364.234375, size: 86.546875 },
	{ key: 'salad', index: 1, start: 364.234375, end: 460.765625, size: 96.53125 },
	{ key: 'cake', index: 2, start: 460.765625, end: 557.296875, size: 96.53125 },
];

export const THREE_CHIP_POST_LIFT: SortableLayoutEntry[] = [
	{ key: 'latte', index: 0, start: 277.6875, end: 364.234375, size: 86.546875 },
	{ key: 'salad', index: 1, start: 284.875, end: 381.40625, size: 96.53125 },
	{ key: 'cake', index: 2, start: 381.40625, end: 477.9375, size: 96.53125 },
];

export const THREE_CHIP_MIDS = [
	{ key: 'latte', index: 0, mid: 277.6875 + 86.546875 / 2 },
	{ key: 'salad', index: 1, mid: 364.234375 + 96.53125 / 2 },
	{ key: 'cake', index: 2, mid: 460.765625 + 96.53125 / 2 },
];
