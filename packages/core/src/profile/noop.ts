export type SortableRectLike = Pick<
	DOMRect,
	'left' | 'top' | 'right' | 'bottom' | 'width' | 'height'
>;

export function fmtPoint(_x: number, _y: number, _label = 'cursor'): string {
	return '';
}

export function fmtRect(
	_rect: SortableRectLike | null | undefined,
	_label = 'box',
): string {
	return '';
}

export function fmtOffset(_ax: number, _ay: number, _bx: number, _by: number): string {
	return '';
}

export function fmtIndexChange(_from: number, _to: number): string {
	return '';
}

export function fmtOrder(
	_keys: readonly string[],
	_insertAt: number,
	_dragKey?: string,
): string {
	return '';
}

export function fmtMids(_mids: readonly { key?: string; mid: number }[]): string {
	return '';
}

export type SortableStoryPayload = {
	story: string;
	data?: Record<string, unknown>;
};

export function sortableAgentLog(
	_hypothesisId: string,
	_location: string,
	_message: string,
	_data: Record<string, unknown>,
	_runId = 'pre-fix',
): void {}

export function sortableStory(
	_hypothesisId: string,
	_location: string,
	_beat: string,
	_build: () => SortableStoryPayload,
	_runId = 'pre-fix',
): void {}

export function sortableRowSnapshot(_row: HTMLElement | null) {
	return null;
}

export function sortableChipSnapshot(_el: HTMLElement | null) {
	return null;
}

export function sortableChipsSnapshot(
	_nodesByKey: Map<string, HTMLElement | SVGElement>,
): Record<string, ReturnType<typeof sortableChipSnapshot>> {
	return {};
}

export function describeChipMotion(
	_key: string,
	_transform: { x: number; y: number } | undefined,
): string {
	return '';
}
