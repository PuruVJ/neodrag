export type SortableDragPayload<T = unknown> = {
	key: string;
	sortableId?: symbol;
	value?: T;
};

export class SortableDragData {
	static is(data: unknown): data is SortableDragPayload {
		if (!data || typeof data !== 'object') return false;
		return typeof (data as SortableDragPayload).key === 'string';
	}

	static key(data: unknown): string {
		return SortableDragData.is(data) ? data.key : '';
	}

	static sourceId(data: unknown): symbol | undefined {
		return SortableDragData.is(data) ? data.sortableId : undefined;
	}

	static containerIdFromState(state: unknown): symbol | undefined {
		return (state as { sortableId?: symbol } | undefined)?.sortableId;
	}
}

export function isSortableDragPayload(data: unknown): data is SortableDragPayload {
	return SortableDragData.is(data);
}

export function sortableDragKey(data: unknown): string {
	return SortableDragData.key(data);
}

export function sortableSourceId(data: unknown): symbol | undefined {
	return SortableDragData.sourceId(data);
}
