import type { Rng } from './rng.ts';

export type Point = { x: number; y: number };

export function minimumJerk(t: number): number {
	const u = Math.max(0, Math.min(1, t));
	return u * u * u * (10 + u * (-15 + u * 6));
}

export function fittsDurationMs(distancePx: number, targetSizePx: number): number {
	const a = 50;
	const b = 150;
	const w = Math.max(4, targetSizePx);
	const id = Math.log2(distancePx / w + 1);
	return a + b * Math.max(0, id);
}

export function tremorOffset(rng: Rng, tMs: number, ampPx: number, hz = 10): Point {
	const phase = (tMs / 1000) * hz * Math.PI * 2;
	const x = Math.sin(phase) * ampPx + rng.gaussian(0, ampPx * 0.15);
	const y = Math.cos(phase * 1.07) * ampPx + rng.gaussian(0, ampPx * 0.15);
	return { x, y };
}

export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function lerpPoint(from: Point, to: Point, t: number): Point {
	return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
}

export function distance(a: Point, b: Point): number {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	return Math.hypot(dx, dy);
}

export type MotionSample = { x: number; y: number; dt: number };

export function sampleMinimumJerkPath(
	from: Point,
	to: Point,
	durationMs: number,
	sampleCount: number,
	rng: Rng,
	tremorAmp = 0,
): MotionSample[] {
	const samples: MotionSample[] = [];
	const dt = durationMs / Math.max(1, sampleCount);
	for (let i = 1; i <= sampleCount; i++) {
		const t = minimumJerk(i / sampleCount);
		let p = lerpPoint(from, to, t);
		if (tremorAmp > 0) {
			const tr = tremorOffset(rng, i * dt, tremorAmp);
			p = { x: p.x + tr.x, y: p.y + tr.y };
		}
		samples.push({ x: p.x, y: p.y, dt });
	}
	return samples;
}

export function applyJitterToSamples(
	samples: MotionSample[],
	rng: Rng,
	ampPx: number,
): MotionSample[] {
	return samples.map((s, i) => ({
		...s,
		x: s.x + rng.gaussian(0, ampPx),
		y: s.y + rng.gaussian(0, ampPx),
		dt: s.dt * rng.range(0.85, 1.15),
	}));
}
