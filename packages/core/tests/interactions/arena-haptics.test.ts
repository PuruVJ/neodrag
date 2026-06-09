/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DragEventData } from '../../src/drag/drag.ts';
import { haptics } from '../../src/extend/haptics.ts';

/** A minimal DragEventData ctx — haptics ignores its contents, it only fires vibrate. */
const ctx = (): DragEventData => ({
	offset: { x: 0, y: 0 },
	node: document.createElement('div') as unknown as DragEventData['node'],
	input: {} as DragEventData['input'],
});

const nav = navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };

afterEach(() => {
	delete nav.vibrate;
	vi.restoreAllMocks();
});

describe('haptics() — DragPlugin shape', () => {
	it('is a named DragPlugin exposing onStart/onEnd', () => {
		const p = haptics();
		expect(p.name).toBe('haptics');
		expect(typeof p.onStart).toBe('function');
		expect(typeof p.onEnd).toBe('function');
		// It is a pure extension plugin — no move hook.
		expect(p.onMove).toBeUndefined();
	});
});

describe('haptics() — navigator.vibrate firing', () => {
	it('fires a default 10ms tap on drag start', () => {
		const vibrate = vi.fn(() => true);
		nav.vibrate = vibrate;

		const p = haptics();
		p.onStart!(ctx());

		expect(vibrate).toHaveBeenCalledTimes(1);
		expect(vibrate).toHaveBeenCalledWith(10);
	});

	it('is silent on end by default (no end pattern)', () => {
		const vibrate = vi.fn(() => true);
		nav.vibrate = vibrate;

		const p = haptics();
		p.onEnd!(ctx());

		expect(vibrate).not.toHaveBeenCalled();
	});

	it('fires custom start and end patterns, including on/off sequences', () => {
		const vibrate = vi.fn(() => true);
		nav.vibrate = vibrate;

		const p = haptics({ start: [20, 10, 20], end: 5 });
		p.onStart!(ctx());
		p.onEnd!(ctx());

		expect(vibrate).toHaveBeenNthCalledWith(1, [20, 10, 20]);
		expect(vibrate).toHaveBeenNthCalledWith(2, 5);
		expect(vibrate).toHaveBeenCalledTimes(2);
	});

	it('does not vibrate when a pattern is explicitly undefined', () => {
		const vibrate = vi.fn(() => true);
		nav.vibrate = vibrate;

		// start undefined falls back to default 10; end undefined stays silent.
		const p = haptics({ start: 10, end: undefined });
		p.onEnd!(ctx());
		expect(vibrate).not.toHaveBeenCalled();
		p.onStart!(ctx());
		expect(vibrate).toHaveBeenCalledExactlyOnceWith(10);
	});
});

describe('haptics() — graceful degradation', () => {
	it('is a no-op when the Vibration API is unsupported (vibrate absent)', () => {
		// No nav.vibrate defined — the optional chaining must swallow it.
		expect('vibrate' in nav && nav.vibrate).toBeFalsy();
		const p = haptics();
		expect(() => {
			p.onStart!(ctx());
			p.onEnd!(ctx());
		}).not.toThrow();
	});

	it('returns whatever vibrate returns to no one — never throws on a falsey return', () => {
		nav.vibrate = vi.fn(() => false); // API present but rejected the request
		const p = haptics();
		expect(() => p.onStart!(ctx())).not.toThrow();
	});
});

describe('haptics() — SSR guard (no navigator)', () => {
	it('does not throw when navigator is undefined', () => {
		const saved = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
		try {
			// Simulate a server environment with no navigator at all.
			Object.defineProperty(globalThis, 'navigator', {
				value: undefined,
				configurable: true,
			});
			const p = haptics({ start: 10, end: 10 });
			expect(() => {
				p.onStart!(ctx());
				p.onEnd!(ctx());
			}).not.toThrow();
		} finally {
			if (saved) Object.defineProperty(globalThis, 'navigator', saved);
		}
	});
});
