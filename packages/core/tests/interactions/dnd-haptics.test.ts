/** @vitest-environment jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { haptics } from '../../src/extend/haptics.ts';

const node = document.createElement('div');
const ctx = { offset: { x: 0, y: 0 }, node, input: null as never };

describe('haptics plugin (use:[] seam)', () => {
	let vibrate: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vibrate = vi.fn();
		vi.stubGlobal('navigator', { vibrate });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('buzzes 10ms on start by default and stays silent on end', () => {
		const p = haptics();
		p.onStart!(ctx);
		expect(vibrate).toHaveBeenCalledTimes(1);
		expect(vibrate).toHaveBeenCalledWith(10);

		p.onEnd!(ctx);
		expect(vibrate).toHaveBeenCalledTimes(1);
	});

	it('fires the configured start and end patterns', () => {
		const p = haptics({ start: 25, end: [10, 30, 10] });
		p.onStart!(ctx);
		expect(vibrate).toHaveBeenLastCalledWith(25);

		p.onEnd!(ctx);
		expect(vibrate).toHaveBeenLastCalledWith([10, 30, 10]);
		expect(vibrate).toHaveBeenCalledTimes(2);
	});

	it('applies the 10ms start default when start is undefined, and stays silent on end', () => {
		const p = haptics({ start: undefined, end: undefined });
		p.onStart!(ctx);
		expect(vibrate).toHaveBeenCalledWith(10);
		p.onEnd!(ctx);
		expect(vibrate).toHaveBeenCalledTimes(1);
	});

	it('is a no-op when the Vibration API is unsupported', () => {
		vi.stubGlobal('navigator', {});
		const p = haptics();
		expect(() => p.onStart!(ctx)).not.toThrow();
	});
});
