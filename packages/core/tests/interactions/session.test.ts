/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { resolveEndReason } from '../../src/interactions/session.ts';
import type { ActiveSession } from '../../src/interactions/instance.ts';
import { SessionPrivate } from '../../src/interactions/instance.ts';

function active(over: Partial<ActiveSession> = {}): ActiveSession {
	return {
		state: 'active',
		sourceNode: {} as HTMLElement,
		visualNode: {} as HTMLElement,
		sourceRect: new DOMRect(),
		visualRect: new DOMRect(),
		pointerX: 0,
		pointerY: 0,
		deltaX: 0,
		deltaY: 0,
		data: undefined,
		overTargets: [],
		private: new SessionPrivate(),
		propagationStopped: false,
		pointerId: 1,
		startedAt: 0,
		cancel() {},
		...over,
	};
}

describe('resolveEndReason', () => {
	it('returns cancel when cancelled flag is set', () => {
		expect(resolveEndReason(active(), true)).toBe('cancel');
	});

	it('returns cancel when session state is cancelled', () => {
		expect(resolveEndReason(active({ state: 'cancelled' }), false)).toBe('cancel');
	});

	it('returns drop when overTargets is non-empty', () => {
		expect(
			resolveEndReason(
				active({
					overTargets: [{ node: {} as HTMLElement, rect: new DOMRect(0, 0, 1, 1) }],
				}),
				false,
			),
		).toBe('drop');
	});

	it('returns no-target when not cancelled and no over targets', () => {
		expect(resolveEndReason(active(), false)).toBe('no-target');
		expect(resolveEndReason(null, false)).toBe('no-target');
	});
});
