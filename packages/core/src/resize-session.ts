import type { ActiveResizeSession } from './resize-instance.ts';
import { transitionSession } from './state-machine.ts';
import type { ResizeEdge, ResizeSession } from './resize/types.ts';

export function createResizeSession(active: ActiveResizeSession): ResizeSession {
	return {
		get state() {
			return active.state;
		},
		get source() {
			return { node: active.sourceNode, rect: active.sourceRect };
		},
		get anchor() {
			return active.anchor;
		},
		get pointer() {
			return { x: active.pointerX, y: active.pointerY };
		},
		get delta() {
			return { width: active.deltaWidth, height: active.deltaHeight };
		},
		get size() {
			return { width: `${active.width}px`, height: `${active.height}px` };
		},
		get sizePx() {
			return { width: active.width, height: active.height };
		},
		get data() {
			return active.data;
		},
		set data(value) {
			active.data = value;
		},
		cancel() {
			active.state = transitionSession(active.state, { type: 'cancel' });
		},
	};
}

export function resolveResizeEndReason(
	active: ActiveResizeSession | null,
	cancelled: boolean,
): 'commit' | 'cancel' {
	if (cancelled || active?.state === 'cancelled') return 'cancel';
	return 'commit';
}

export function sizeFromPointer(
	anchor: ResizeEdge,
	initialPointerX: number,
	initialPointerY: number,
	initialWidth: number,
	initialHeight: number,
	clientX: number,
	clientY: number,
	inverseScale: number,
): { width: number; height: number } {
	const dx = (clientX - initialPointerX) * inverseScale;
	const dy = (clientY - initialPointerY) * inverseScale;
	let width = initialWidth;
	let height = initialHeight;

	if (anchor.includes('e')) width = initialWidth + dx;
	if (anchor.includes('w')) width = initialWidth - dx;
	if (anchor.includes('s')) height = initialHeight + dy;
	if (anchor.includes('n')) height = initialHeight - dy;

	return { width, height };
}
