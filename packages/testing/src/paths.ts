import {
	applyJitterToSamples,
	distance,
	fittsDurationMs,
	lerpPoint,
	sampleMinimumJerkPath,
	type MotionSample,
	type Point,
} from './kinematics.ts';
import { createRng, type Rng } from './rng.ts';

export type PathContext = {
	rng: Rng;
	cursor: Point;
};

export type GestureSegment = {
	name: string;
	build(ctx: PathContext): { samples: MotionSample[]; endCursor: Point };
};

export type SegmentFactory = (rng: Rng, ctx: PathContext) => GestureSegment;

export function dwell(ms: number): SegmentFactory {
	return (_rng, _ctx) => ({
		name: 'dwell',
		build(ctx) {
			return { samples: [{ x: ctx.cursor.x, y: ctx.cursor.y, dt: ms }], endCursor: ctx.cursor };
		},
	});
}

export function moveToHuman(to: Point, opts?: { tremor?: number; samples?: number }): SegmentFactory {
	return (rng, _ctx) => ({
		name: 'moveToHuman',
		build(c) {
			const dist = distance(c.cursor, to);
			const duration = fittsDurationMs(dist, 24);
			const count = opts?.samples ?? Math.max(8, Math.round(duration / 12));
			const samples = sampleMinimumJerkPath(
				c.cursor,
				to,
				duration,
				count,
				rng,
				opts?.tremor ?? 0.5,
			);
			return { samples, endCursor: to };
		},
	});
}

export function lineTo(to: Point, steps = 12): SegmentFactory {
	return (_rng, _ctx) => ({
		name: 'lineTo',
		build(ctx) {
			const samples: MotionSample[] = [];
			const dt = 8;
			for (let i = 1; i <= steps; i++) {
				const t = i / steps;
				const p = lerpPoint(ctx.cursor, to, t);
				samples.push({ x: p.x, y: p.y, dt });
			}
			return { samples, endCursor: to };
		},
	});
}

export function curveTo(to: Point, bowPx: number): SegmentFactory {
	return (rng) => ({
		name: 'curveTo',
		build(ctx) {
			const mid = {
				x: (ctx.cursor.x + to.x) / 2 + rng.gaussian(0, bowPx),
				y: (ctx.cursor.y + to.y) / 2 + rng.gaussian(0, bowPx),
			};
			const samples: MotionSample[] = [];
			const steps = 16;
			const dt = 10;
			for (let i = 1; i <= steps; i++) {
				const t = i / steps;
				const u = 1 - t;
				const x = u * u * ctx.cursor.x + 2 * u * t * mid.x + t * t * to.x;
				const y = u * u * ctx.cursor.y + 2 * u * t * mid.y + t * t * to.y;
				samples.push({ x, y, dt });
			}
			return { samples, endCursor: to };
		},
	});
}

export function zigzag(to: Point, opts?: { amplitude?: number; freq?: number }): SegmentFactory {
	return (rng) => ({
		name: 'zigzag',
		build(ctx) {
			const amp = opts?.amplitude ?? 12;
			const freq = opts?.freq ?? 6;
			const steps = Math.max(12, Math.round(distance(ctx.cursor, to) / 8));
			const samples: MotionSample[] = [];
			const perp = {
				x: -(to.y - ctx.cursor.y),
				y: to.x - ctx.cursor.x,
			};
			const len = Math.hypot(perp.x, perp.y) || 1;
			perp.x /= len;
			perp.y /= len;
			for (let i = 1; i <= steps; i++) {
				const t = i / steps;
				const base = lerpPoint(ctx.cursor, to, t);
				const wobble = Math.sin(t * Math.PI * freq) * amp * (1 - t * 0.3);
				samples.push({
					x: base.x + perp.x * wobble + rng.gaussian(0, 1),
					y: base.y + perp.y * wobble + rng.gaussian(0, 1),
					dt: rng.range(6, 14),
				});
			}
			return { samples, endCursor: to };
		},
	});
}

export function scribblePath(opts?: {
	radius?: number;
	revolutions?: number;
	chaos?: number;
	durationMs?: number;
}): SegmentFactory {
	return (rng) => ({
		name: 'scribblePath',
		build(ctx) {
			const radius = opts?.radius ?? 40;
			const revolutions = opts?.revolutions ?? 4;
			const chaos = opts?.chaos ?? 1;
			const durationMs = opts?.durationMs ?? 600;
			const steps = Math.max(24, Math.round((revolutions * 16) / chaos));
			const dt = durationMs / steps;
			const samples: MotionSample[] = [];
			const cx = ctx.cursor.x;
			const cy = ctx.cursor.y;
			for (let i = 1; i <= steps; i++) {
				const angle = (i / steps) * Math.PI * 2 * revolutions;
				const r = radius * rng.range(0.4, 1.2) * chaos;
				samples.push({
					x: cx + Math.cos(angle) * r + rng.gaussian(0, 3 * chaos),
					y: cy + Math.sin(angle) * r + rng.gaussian(0, 3 * chaos),
					dt: dt * rng.range(0.7, 1.3),
				});
			}
			return { samples, endCursor: { x: cx, y: cy } };
		},
	});
}

export function overshootTo(to: Point, opts?: { distancePx?: number; settleMs?: number }): SegmentFactory {
	return (rng) => ({
		name: 'overshootTo',
		build(ctx) {
			const dist = distance(ctx.cursor, to);
			const dir =
				dist > 0
					? { x: (to.x - ctx.cursor.x) / dist, y: (to.y - ctx.cursor.y) / dist }
					: { x: 1, y: 0 };
			const overshoot = opts?.distancePx ?? rng.range(8, 24);
			const past = { x: to.x + dir.x * overshoot, y: to.y + dir.y * overshoot };
			const toPast = sampleMinimumJerkPath(ctx.cursor, past, opts?.settleMs ?? 120, 10, rng, 0.3);
			const settle = sampleMinimumJerkPath(past, to, 80, 8, rng, 0.5);
			return {
				samples: [...toPast, ...settle],
				endCursor: to,
			};
		},
	});
}

export function flick(dir: Point, distancePx: number): SegmentFactory {
	return (rng) => ({
		name: 'flick',
		build(ctx) {
			const len = Math.hypot(dir.x, dir.y) || 1;
			const to = {
				x: ctx.cursor.x + (dir.x / len) * distancePx,
				y: ctx.cursor.y + (dir.y / len) * distancePx,
			};
			const samples = sampleMinimumJerkPath(ctx.cursor, to, 60, 6, rng, 0);
			return { samples, endCursor: to };
		},
	});
}

export function jitterSegment(ampPx: number): SegmentFactory {
	return (rng) => ({
		name: 'jitter',
		build(ctx) {
			const samples = applyJitterToSamples(
				[{ x: ctx.cursor.x, y: ctx.cursor.y, dt: 16 }],
				rng,
				ampPx,
			);
			for (let i = 0; i < 6; i++) {
				samples.push({
					x: ctx.cursor.x + rng.gaussian(0, ampPx),
					y: ctx.cursor.y + rng.gaussian(0, ampPx),
					dt: rng.range(8, 20),
				});
			}
			return { samples, endCursor: ctx.cursor };
		},
	});
}

export function buildSegments(
	seed: number,
	start: Point,
	factories: SegmentFactory[],
): { samples: MotionSample[]; segments: { name: string; startIndex: number; count: number }[] } {
	const rng = createRng(seed);
	let ctx: PathContext = { rng, cursor: start };
	const all: MotionSample[] = [];
	const segments: { name: string; startIndex: number; count: number }[] = [];

	for (const factory of factories) {
		const segment = factory(rng, ctx);
		const built = segment.build(ctx);
		segments.push({ name: segment.name, startIndex: all.length, count: built.samples.length });
		all.push(...built.samples);
		ctx = { rng, cursor: built.endCursor };
	}

	return { samples: all, segments };
}
