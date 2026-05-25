/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { transitionSession } from '../../src/interactions/state-machine.ts';

describe('interactions state machine', () => {
	it('idle → pending on pointerdown', () => {
		expect(transitionSession('idle', { type: 'pointerdown' })).toBe('pending');
	});

	it('pending → active on threshold-passed', () => {
		expect(transitionSession('pending', { type: 'threshold-passed' })).toBe('active');
	});

	it('pending → cancelled on cancel', () => {
		expect(transitionSession('pending', { type: 'cancel' })).toBe('cancelled');
	});

	it('pending → cancelled on start-abort', () => {
		expect(transitionSession('pending', { type: 'start-abort' })).toBe('cancelled');
	});

	it('pending → completed on pointerup with no-target', () => {
		expect(transitionSession('pending', { type: 'pointerup', reason: 'no-target' })).toBe(
			'completed',
		);
	});

	it('active → completed on drop pointerup', () => {
		expect(transitionSession('active', { type: 'pointerup', reason: 'drop' })).toBe('completed');
	});

	it('active → cancelled on cancel pointerup', () => {
		expect(transitionSession('active', { type: 'pointerup', reason: 'cancel' })).toBe('cancelled');
	});

	it('completed → idle on pointerdown', () => {
		expect(transitionSession('completed', { type: 'pointerdown' })).toBe('idle');
	});
});
