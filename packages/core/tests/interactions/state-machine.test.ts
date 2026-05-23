/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { isTerminal, transitionSession } from '../../src/interactions/state-machine.ts';

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

	it('active → completed on drop pointerup', () => {
		expect(transitionSession('active', { type: 'pointerup', reason: 'drop' })).toBe('completed');
	});

	it('active → cancelled on cancel pointerup', () => {
		expect(transitionSession('active', { type: 'pointerup', reason: 'cancel' })).toBe('cancelled');
	});

	it('completed → idle is terminal reset', () => {
		expect(isTerminal('completed')).toBe(true);
		expect(transitionSession('completed', { type: 'pointerdown' })).toBe('idle');
	});
});
