export const SORTABLE_ROW_ATTR = 'data-neodrag-sortable-row';
export const SORTABLE_KEY_ATTR = 'data-sortable-key';

export type NeodragMarkupAttrs = Readonly<Record<string, string>>;

export const sortableRowAttrs = (): NeodragMarkupAttrs =>
	({ [SORTABLE_ROW_ATTR]: '' }) as const;

export function dragTargetAttrs(): NeodragMarkupAttrs {
	return {
		draggable: 'false',
		style: 'touch-action: none',
		'data-neodrag': '',
		'data-neodrag-state': 'idle',
		'data-neodrag-count': '0',
	};
}

export function sortableItemAttrs(key: string): NeodragMarkupAttrs {
	return {
		draggable: 'false',
		[SORTABLE_KEY_ATTR]: key,
	};
}

export function dropZoneAttrs(): NeodragMarkupAttrs {
	return {};
}

export function resizeFrameAttrs(): NeodragMarkupAttrs {
	return {};
}
