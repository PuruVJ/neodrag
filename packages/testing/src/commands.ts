import type { PlayMode } from './backend.ts';
import { composeAndPlay } from './gesture.ts';
import type { Point } from './kinematics.ts';
import {
	curveTo,
	dwell,
	jitterSegment,
	lineTo,
	moveToHuman,
	overshootTo,
	scribblePath as scribbleSegment,
	zigzag,
} from './paths.ts';
import { createRng, randomSeed } from './rng.ts';
import type { ElementLike, ResizeEdge } from './targets.ts';
import {
	centerOf,
	edgePoint,
	indexOfSortableItem,
	midpointBetween,
	resolveElement,
	resolveHandle,
	sortableItemAt,
	sortableItems,
} from './targets.ts';

export type Intensity = 'tame' | 'normal' | 'wild' | 'chaotic';

export type RealnessOptions = {
	seed?: number;
	intensity?: Intensity;
	mode?: PlayMode;
	trusted?: boolean;
};

function intensityScale(intensity: Intensity = 'normal') {
	switch (intensity) {
		case 'tame':
			return { tremor: 0.2, zigzag: 4, overshoot: 6, scribble: 0.5 };
		case 'wild':
			return { tremor: 1.2, zigzag: 18, overshoot: 28, scribble: 1.4 };
		case 'chaotic':
			return { tremor: 2.5, zigzag: 32, overshoot: 48, scribble: 2.2 };
		default:
			return { tremor: 0.6, zigzag: 10, overshoot: 16, scribble: 1 };
	}
}

export async function wildDrag(
	el: ElementLike,
	target: ElementLike,
	opts: RealnessOptions = {},
): Promise<Point> {
	const scale = intensityScale(opts.intensity);
	const from = await centerOf(el);
	const to = await centerOf(target);
	const grab = await resolveElement(el);
	const { end } = await composeAndPlay(
		grab,
		[
			moveToHuman(to, { tremor: scale.tremor }),
			zigzag(to, { amplitude: scale.zigzag }),
			overshootTo(to, { distancePx: scale.overshoot }),
			jitterSegment(scale.tremor),
		],
		{ seed: opts.seed, start: from, mode: opts.mode, trusted: opts.trusted },
	);
	return end;
}

export async function humanDragAndDrop(
	el: ElementLike,
	target: ElementLike,
	opts: RealnessOptions = {},
): Promise<Point> {
	const scale = intensityScale(opts.intensity ?? 'tame');
	const from = await centerOf(el);
	const to = await centerOf(target);
	const grab = await resolveElement(el);
	const { end } = await composeAndPlay(
		grab,
		[moveToHuman(to, { tremor: scale.tremor }), overshootTo(to, { distancePx: scale.overshoot * 0.5 })],
		{ seed: opts.seed, start: from, mode: opts.mode, trusted: opts.trusted },
	);
	return end;
}

export async function scribbleInPlace(
	el: ElementLike,
	opts: RealnessOptions & { durationMs?: number; radius?: number } = {},
): Promise<Point> {
	const scale = intensityScale(opts.intensity ?? 'wild');
	const from = await centerOf(el);
	const grab = await resolveElement(el);
	const { end } = await composeAndPlay(
		grab,
		[
			scribbleSegment({
				radius: opts.radius ?? 40,
				durationMs: opts.durationMs ?? 600,
				chaos: scale.scribble,
				revolutions: opts.intensity === 'chaotic' ? 6 : 4,
			}),
		],
		{ seed: opts.seed, start: from, mode: opts.mode ?? 'realtime', trusted: opts.trusted },
	);
	return end;
}

export async function fuzzDrag(
	el: ElementLike,
	opts: RealnessOptions & { area?: { width: number; height: number } } = {},
): Promise<Point> {
	const seed = opts.seed ?? randomSeed();
	const rng = createRng(seed);
	const from = await centerOf(el);
	const grab = await resolveElement(el);
	const area = opts.area ?? { width: 200, height: 200 };
	const to = {
		x: from.x + rng.range(-area.width / 2, area.width / 2),
		y: from.y + rng.range(-area.height / 2, area.height / 2),
	};
	const scale = intensityScale(opts.intensity ?? 'chaotic');
	const { end } = await composeAndPlay(
		grab,
		[
			curveTo(to, scale.zigzag),
			zigzag(to, { amplitude: scale.zigzag }),
			scribbleSegment({ radius: 20, durationMs: 200, chaos: scale.scribble * 0.5 }),
			moveToHuman(to, { tremor: scale.tremor }),
		],
		{ seed, start: from, mode: opts.mode, trusted: opts.trusted },
	);
	return end;
}

export async function dropOnto(
	el: ElementLike,
	zone: ElementLike,
	opts: RealnessOptions = {},
): Promise<Point> {
	return humanDragAndDrop(el, zone, opts);
}

export async function wildDropApproach(
	el: ElementLike,
	zone: ElementLike,
	opts: RealnessOptions & { passes?: number } = {},
): Promise<Point> {
	const scale = intensityScale(opts.intensity ?? 'wild');
	const grab = await resolveElement(el);
	const zoneEl = await resolveElement(zone);
	const rect = zoneEl.getBoundingClientRect();
	const from = await centerOf(grab);
	const inside = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	const outside = edgePoint(rect, 'top', 20, true);
	const passes = opts.passes ?? 3;
	const factories = [];
	for (let i = 0; i < passes; i++) {
		factories.push(moveToHuman(outside, { tremor: scale.tremor }));
		factories.push(zigzag(inside, { amplitude: scale.zigzag }));
		factories.push(overshootTo(inside, { distancePx: scale.overshoot }));
	}
	factories.push(dwell(30));
	const { end } = await composeAndPlay(grab, factories, {
		seed: opts.seed,
		start: from,
		mode: opts.mode,
		trusted: opts.trusted,
	});
	return end;
}

export async function hoverChurn(
	el: ElementLike,
	zone: ElementLike,
	opts: RealnessOptions & { passes?: number } = {},
): Promise<void> {
	await wildDropApproach(el, zone, { ...opts, passes: opts.passes ?? 6 });
}

export async function dropOnOverlap(
	el: ElementLike,
	zones: ElementLike[],
	opts: RealnessOptions = {},
): Promise<Point> {
	const resolved = await Promise.all(zones.map((z) => resolveElement(z)));
	let seam: Point | null = null;
	if (resolved.length >= 2) {
		const a = resolved[0]!.getBoundingClientRect();
		const b = resolved[1]!.getBoundingClientRect();
		seam = {
			x: (a.right + b.left) / 2,
			y: (a.top + a.bottom + b.top + b.bottom) / 4,
		};
	}
	const target = seam ?? (await centerOf(resolved[0]!));
	const grab = await resolveElement(el);
	const from = await centerOf(grab);
	const scale = intensityScale(opts.intensity);
	const { end } = await composeAndPlay(
		grab,
		[curveTo(target, scale.zigzag), overshootTo(target, { distancePx: scale.overshoot })],
		{ seed: opts.seed, start: from, mode: opts.mode, trusted: opts.trusted },
	);
	return end;
}

export async function sortableReorder(
	item: ElementLike,
	toIndex: number,
	list: ElementLike,
	opts: RealnessOptions = {},
): Promise<Point> {
	const targetItem = await sortableItemAt(list, toIndex);
	return humanDragAndDrop(item, targetItem, { ...opts, intensity: opts.intensity ?? 'tame' });
}

export async function wildReorder(
	item: ElementLike,
	toIndex: number,
	list: ElementLike,
	opts: RealnessOptions = {},
): Promise<Point> {
	const scale = intensityScale(opts.intensity ?? 'wild');
	const grab = await resolveElement(item);
	const from = await centerOf(grab);
	const fromIndex = await indexOfSortableItem(item, list);
	const items = await sortableItems(list);
	const target = await centerOf(await sortableItemAt(list, toIndex));
	const factories = [];
	if (fromIndex === toIndex) {
		factories.push(moveToHuman(target, { tremor: scale.tremor }));
	} else {
	const step = fromIndex < toIndex ? 1 : -1;
	for (let i = fromIndex; i !== toIndex; i += step) {
		const next = i + step;
		if (next < 0 || next >= items.length) break;
		const mid = await midpointBetween(items[i]!, items[next]!);
		factories.push(zigzag(mid, { amplitude: scale.zigzag }));
		factories.push(moveToHuman(mid, { tremor: scale.tremor }));
		factories.push(jitterSegment(scale.tremor));
	}
	factories.push(overshootTo(target, { distancePx: scale.overshoot }));
	}
	const { end } = await composeAndPlay(grab, factories, {
		seed: opts.seed,
		start: from,
		mode: opts.mode,
		trusted: opts.trusted,
	});
	return end;
}

export async function midpointThrash(
	item: ElementLike,
	neighbor: ElementLike,
	opts: RealnessOptions & { passes?: number } = {},
): Promise<void> {
	const scale = intensityScale(opts.intensity ?? 'chaotic');
	const grab = await resolveElement(item);
	const from = await centerOf(grab);
	const mid = await midpointBetween(item, neighbor);
	const passes = opts.passes ?? 8;
	const factories = [];
	for (let i = 0; i < passes; i++) {
		const offset = scale.zigzag * (i % 2 === 0 ? 1 : -1);
		factories.push(
			zigzag({ x: mid.x + offset, y: mid.y }, { amplitude: scale.zigzag }),
		);
		factories.push(jitterSegment(scale.tremor));
	}
	await composeAndPlay(grab, factories, {
		seed: opts.seed,
		start: from,
		mode: opts.mode ?? 'realtime',
		trusted: opts.trusted,
	});
}

export async function crossListTransfer(
	item: ElementLike,
	fromList: ElementLike,
	toList: ElementLike,
	toIndex: number,
	opts: RealnessOptions = {},
): Promise<Point> {
	void fromList;
	const targetItem = await sortableItemAt(toList, toIndex);
	const scale = intensityScale(opts.intensity ?? 'normal');
	const grab = await resolveElement(item);
	const from = await centerOf(grab);
	const to = await centerOf(targetItem);
	const listRect = (await resolveElement(toList)).getBoundingClientRect();
	const waypoint = { x: listRect.left + listRect.width / 2, y: listRect.top + 20 };
	const { end } = await composeAndPlay(
		grab,
		[
			moveToHuman(waypoint, { tremor: scale.tremor }),
			curveTo(to, scale.zigzag),
			zigzag(to, { amplitude: scale.zigzag }),
			overshootTo(to, { distancePx: scale.overshoot }),
		],
		{ seed: opts.seed, start: from, mode: opts.mode, trusted: opts.trusted },
	);
	return end;
}

export async function resizeHandle(
	el: ElementLike,
	edge: ResizeEdge,
	delta: { deltaX: number; deltaY: number },
	opts: RealnessOptions = {},
): Promise<Point> {
	const { handle, point } = await resolveHandle(el, edge);
	const to = { x: point.x + delta.deltaX, y: point.y + delta.deltaY };
	const scale = intensityScale(opts.intensity ?? 'tame');
	const { end } = await composeAndPlay(
		handle,
		[lineTo(to, 10)],
		{ seed: opts.seed, start: point, mode: opts.mode, trusted: opts.trusted },
	);
	return end;
}

export async function wildResize(
	el: ElementLike,
	edge: ResizeEdge,
	opts: RealnessOptions & { zigzag?: boolean; overshoot?: number } = {},
): Promise<Point> {
	const { handle, point } = await resolveHandle(el, edge);
	const scale = intensityScale(opts.intensity ?? 'wild');
	const rng = createRng(opts.seed ?? randomSeed());
	const dist = opts.overshoot ?? rng.range(40, 120);
	const dir = { x: 0, y: 0 };
	if (edge.includes('e')) dir.x = dist;
	if (edge.includes('w')) dir.x = -dist;
	if (edge.includes('s')) dir.y = dist;
	if (edge.includes('n')) dir.y = -dist;
	const to = { x: point.x + dir.x, y: point.y + dir.y };
	const factories = [
		moveToHuman(to, { tremor: scale.tremor }),
		...(opts.zigzag !== false ? [zigzag(to, { amplitude: scale.zigzag })] : []),
		overshootTo(to, { distancePx: opts.overshoot ?? scale.overshoot }),
	];
	const { end } = await composeAndPlay(handle, factories, {
		seed: opts.seed,
		start: point,
		mode: opts.mode,
		trusted: opts.trusted,
	});
	return end;
}

export async function resizeBeyondBounds(
	el: ElementLike,
	edge: ResizeEdge,
	opts: RealnessOptions & { past?: number } = {},
): Promise<Point> {
	const past = opts.past ?? 200;
	return wildResize(el, edge, { ...opts, overshoot: past, intensity: opts.intensity ?? 'chaotic' });
}

export async function resizeCornerChaos(
	el: ElementLike,
	corner: ResizeEdge,
	opts: RealnessOptions = {},
): Promise<Point> {
	const { handle, point } = await resolveHandle(el, corner);
	const scale = intensityScale(opts.intensity ?? 'chaotic');
	const rng = createRng(opts.seed ?? randomSeed());
	const r = rng.range(30, 80);
	const to = { x: point.x + r, y: point.y + r };
	const { end } = await composeAndPlay(
		handle,
		[
			scribbleSegment({ radius: r * 0.5, durationMs: 400, chaos: scale.scribble }),
			zigzag(to, { amplitude: scale.zigzag }),
			overshootTo(to, { distancePx: scale.overshoot }),
		],
		{ seed: opts.seed, start: point, mode: opts.mode ?? 'realtime', trusted: opts.trusted },
	);
	return end;
}
