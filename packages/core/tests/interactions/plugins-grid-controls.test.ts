/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { grid, controls } from '../../src/interactions/plugins.ts';

describe('grid plugin', () => {
	it('skips X snapping when step is 0 but still snaps Y', () => {
		const plugin = grid([0, 10]);
		const ctx = {
			proposed: { x: 7, y: 7 },
		} as Parameters<NonNullable<typeof plugin.drag>>[0];
		const patch = plugin.drag!(ctx, undefined as never, undefined as never);
		expect(patch).toEqual({ y: 10 });
	});
});

describe('controls priority', () => {
	it('prefers block zones when priority is block and areas tie', () => {
		const plugin = controls({ priority: 'block' });
		const state = plugin.init!({
			rootNode: document.createElement('div'),
		} as Parameters<NonNullable<typeof plugin.init>>[0]);
		state.allow = [
			{
				element: document.createElement('div'),
				area: 100,
				top: 0,
				left: 0,
				right: 100,
				bottom: 100,
			},
		];
		state.block = [
			{
				element: document.createElement('div'),
				area: 100,
				top: 0,
				left: 0,
				right: 100,
				bottom: 100,
			},
		];

		const event = new PointerEvent('pointerdown', { clientX: 50, clientY: 50 });
		const ctx = {
			cachedRootNodeRect: new DOMRect(0, 0, 200, 200),
			session: { setVisual: () => {} },
		} as Parameters<NonNullable<typeof plugin.start>>[0];

		const out = plugin.start!(ctx, state, event);
		expect(out).toBe(false);
	});
});
