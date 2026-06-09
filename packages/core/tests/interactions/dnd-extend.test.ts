import { describe, expect, it } from 'vitest';
import { magnetic, onMove } from '../../src/extend/index.ts';

describe('@neodrag/extend plugins (use:[] seam)', () => {
	it('magnetic snaps to a target within radius', () => {
		const p = magnetic([{ x: 100, y: 100 }], 20);
		expect(p.onMove!({ offset: { x: 90, y: 95 }, node: null as never, input: null as never })).toEqual({
			x: 100,
			y: 100,
		});
	});

	it('magnetic leaves the offset alone when no target is in range', () => {
		const p = magnetic([{ x: 100, y: 100 }], 20);
		expect(
			p.onMove!({ offset: { x: 0, y: 0 }, node: null as never, input: null as never }),
		).toBeUndefined();
	});

	it('magnetic drift eases toward the target inside the radius, locks inside snap', () => {
		const p = magnetic([{ x: 100, y: 0 }], { radius: 100, snap: 12 });
		const drift = p.onMove!({ offset: { x: 50, y: 0 }, node: null as never, input: null as never }) as {
			x: number;
		};
		expect(drift.x).toBeGreaterThan(50);
		expect(drift.x).toBeLessThan(100);
		expect(p.onMove!({ offset: { x: 95, y: 0 }, node: null as never, input: null as never })).toEqual({
			x: 100,
			y: 0,
		});
	});

	it('magnetic spring flings toward the magnet over frames', () => {
		const p = magnetic([{ x: 100, y: 0 }], { radius: 200, spring: { stiffness: 0.3, damping: 0.7 } });
		p.onStart?.({} as never);
		let out = { x: 0 };
		for (let i = 0; i < 30; i++) {
			out = p.onMove!({ offset: { x: 40, y: 0 }, node: null as never, input: null as never }) as { x: number };
		}
		expect(out.x).toBeGreaterThan(90);
	});

	it('onMove forwards the offset to the callback', () => {
		let seen: { x: number; y: number } | null = null;
		const p = onMove((o) => (seen = o));
		p.onMove!({ offset: { x: 5, y: 6 }, node: null as never, input: null as never });
		expect(seen).toEqual({ x: 5, y: 6 });
	});
});
