import type { DragPlugin, Point } from '../drag/drag.ts';

/**
 * `@neodrag/extend` — tier-2 custom-behavior plugins for the `use: []` seam. These are the
 * long tail kept out of the options-only core (tree-shakes to nothing unless imported).
 */

export { autoScroll, type AutoScrollOptions } from './auto-scroll.ts';
export { scrollLock, type ScrollLockOptions } from './scroll-lock.ts';
export { ghost, type GhostOptions } from './ghost.ts';
export { haptics } from './haptics.ts';
export { ariaDrag, type AriaDragOptions, type AriaDragAnnounce } from './aria.ts';

/** Spring tuning for `magnetic`'s fling mode. Both are unit-normalized (0–1). */
export interface MagneticSpring {
	/** Pull toward the magnet per frame. Higher = snappier. Default 0.2. */
	stiffness?: number;
	/** Velocity retained per frame. Lower = more overshoot/bounce. Default 0.7. */
	damping?: number;
}

export interface MagneticOptions {
	/** Outer attraction radius (px). Outside it the drag is free. Default 24. */
	radius?: number;
	/** Inner zone (px from the magnet) that hard-locks. Default `radius * 0.25`. */
	snap?: number;
	/** Max pull within the radius, 0–1. Default 1. */
	strength?: number;
	/** Maps closeness (0 at the radius edge → 1 at the snap zone) to pull. Default ease-in (t²),
	 * so the item drifts slowly near the edge then accelerates onto the magnet. */
	easing?: (t: number) => number;
	/** Opt into momentum: the item flings onto the magnet, overshoots, and settles. `true` for
	 * defaults, or tune stiffness/damping. Note: integrates only while the pointer is moving. */
	spring?: boolean | MagneticSpring;
}

const easeInQuad = (t: number) => t * t;
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function nearestWithin(targets: readonly Point[], p: Point, r2: number): Point | undefined {
	let best: Point | undefined;
	let bestD = r2;
	for (const t of targets) {
		const dx = t.x - p.x;
		const dy = t.y - p.y;
		const d = dx * dx + dy * dy;
		if (d <= bestD) {
			bestD = d;
			best = t;
		}
	}
	return best;
}

/**
 * Attract the dragged item to the nearest of `targets` (positions in **offset** space — deltas
 * from where the drag started). Pass a number for the legacy hard-snap-within-radius behavior, or
 * options for a two-zone field: drift toward the magnet inside `radius`, hard-lock inside `snap`.
 * `spring: true` swaps the eased drift for momentum (fling + overshoot + settle).
 */
export function magnetic(targets: readonly Point[], options: number | MagneticOptions = {}): DragPlugin {
	// Number form keeps the original semantics: the whole radius is a hard-snap zone.
	const opts: MagneticOptions = typeof options === 'number' ? { radius: options, snap: options } : options;
	const radius = opts.radius ?? 24;
	const snap = opts.snap ?? radius * 0.25;
	const strength = opts.strength ?? 1;
	const easing = opts.easing ?? easeInQuad;
	const r2 = radius * radius;

	const spring = opts.spring;
	if (spring) {
		const stiffness = (spring === true ? undefined : spring.stiffness) ?? 0.2;
		const damping = (spring === true ? undefined : spring.damping) ?? 0.7;
		const pos: Point = { x: 0, y: 0 };
		const vel: Point = { x: 0, y: 0 };
		let active = false;
		let target: Point | null = null;
		const reset = () => {
			active = false;
			target = null;
			vel.x = vel.y = 0;
		};
		return {
			name: 'magnetic',
			onStart: reset,
			onEnd: reset,
			onMove: ({ offset }) => {
				const t = nearestWithin(targets, offset, r2);
				if (!t) {
					active = false;
					target = null;
					return undefined; // out of range → follow the finger
				}
				if (!active) {
					active = true;
					pos.x = offset.x;
					pos.y = offset.y;
					vel.x = vel.y = 0;
				}
				target = t;
				vel.x = (vel.x + (t.x - pos.x) * stiffness) * damping;
				vel.y = (vel.y + (t.y - pos.y) * stiffness) * damping;
				pos.x += vel.x;
				pos.y += vel.y;
				return { x: pos.x, y: pos.y };
			},
			// Keep pumping frames while the spring is still travelling / has velocity.
			animating: () =>
				active &&
				target != null &&
				(Math.hypot(vel.x, vel.y) > 0.05 || Math.hypot(target.x - pos.x, target.y - pos.y) > 0.15),
		};
	}

	// Stateless drift + lock.
	return {
		name: 'magnetic',
		onMove: ({ offset }) => {
			const t = nearestWithin(targets, offset, r2);
			if (!t) return undefined;
			const dist = Math.hypot(t.x - offset.x, t.y - offset.y);
			if (dist <= snap) return t; // hard lock
			const span = radius - snap;
			const closeness = span > 0 ? 1 - (dist - snap) / span : 1;
			const pull = easing(clamp01(closeness)) * strength;
			return { x: offset.x + (t.x - offset.x) * pull, y: offset.y + (t.y - offset.y) * pull };
		},
	};
}

/** Fire a callback on every drag move — e.g. analytics / telemetry. */
export function onMove(fn: (offset: Point) => void): DragPlugin {
	return {
		name: 'on-move',
		onMove: ({ offset }) => {
			fn(offset);
		},
	};
}
