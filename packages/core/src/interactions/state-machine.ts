import type { EndReason, SessionState } from './types.ts';

export type SessionEvent =
	| { type: 'pointerdown' }
	| { type: 'threshold-passed' }
	| { type: 'start-abort' }
	| { type: 'pointerup'; reason: EndReason }
	| { type: 'cancel' };

export function transitionSession(state: SessionState, event: SessionEvent): SessionState {
	switch (state) {
		case 'idle':
			if (event.type === 'pointerdown') return 'pending';
			return state;

		case 'pending':
			if (event.type === 'threshold-passed') return 'active';
			if (event.type === 'start-abort' || event.type === 'cancel') return 'cancelled';
			if (event.type === 'pointerup') {
				return event.reason === 'cancel' ? 'cancelled' : 'completed';
			}
			return state;

		case 'active':
			if (event.type === 'cancel') return 'cancelled';
			if (event.type === 'pointerup') {
				return event.reason === 'cancel' ? 'cancelled' : 'completed';
			}
			return state;

		case 'completed':
		case 'cancelled':
			return 'idle';

		default:
			return state;
	}
}

export function isTerminal(state: SessionState): boolean {
	return state === 'completed' || state === 'cancelled';
}
