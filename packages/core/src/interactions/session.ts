import type { ActiveSession } from './instance.ts';
import type { DragSession, DropTargetInfo, EndReason, SessionState } from './types.ts';

export function createDragSession(
	active: ActiveSession,
	setVisual: (node: HTMLElement | SVGElement) => void,
): DragSession {
	return {
		get state() {
			return active.state;
		},
		get source() {
			return { node: active.sourceNode, rect: active.sourceRect };
		},
		get visual() {
			return { node: active.visualNode, rect: active.visualRect };
		},
		get pointer() {
			return { x: active.pointerX, y: active.pointerY };
		},
		get delta() {
			return { x: active.deltaX, y: active.deltaY };
		},
		get data() {
			return active.data;
		},
		set data(value) {
			active.data = value;
		},
		get overTargets() {
			return active.overTargets;
		},
		get private() {
			return active.private;
		},
		setVisual(node) {
			active.visualNode = node;
			active.visualRect = node.getBoundingClientRect();
			setVisual(node);
		},
		cancel() {
			active.state = 'cancelled';
		},
		stopPropagation() {
			active.propagationStopped = true;
		},
	};
}


export function resolveEndReason(active: ActiveSession | null, cancelled: boolean): EndReason {
	if (cancelled || active?.state === 'cancelled') return 'cancel';
	if (active && active.overTargets.length > 0) return 'drop';
	return 'no-target';
}

export function updateOverTargets(
	active: ActiveSession,
	targets: DropTargetInfo[],
): DropTargetInfo[] {
	active.overTargets = targets;
	return targets;
}

export function setSessionState(active: ActiveSession, state: SessionState) {
	active.state = state;
}
