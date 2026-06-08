import type { PointerBackend, PlayMode, PointerSession } from './backend.ts';
import { pickBackend } from './backend.ts';
import type { Point } from './kinematics.ts';
import type { MotionSample } from './kinematics.ts';
import {
	buildSegments,
	type SegmentFactory,
} from './paths.ts';
import { createRng, randomSeed } from './rng.ts';
import type { ElementLike } from './targets.ts';
import { centerOf, resolveElement } from './targets.ts';

export type GestureSegmentMeta = { name: string; startIndex: number; count: number };

export type Gesture = {
	seed: number;
	start: Point;
	samples: MotionSample[];
	segments: GestureSegmentMeta[];
	target: Element;
	grabTarget: Element;
};

export type PlayOptions = {
	backend?: PointerBackend;
	trusted?: boolean;
	mode?: PlayMode;
};

export type ComposeOptions = {
	seed?: number;
	start?: Point;
	grabTarget?: Element;
	target?: Element;
};

export function compose(
	grabTarget: Element,
	factories: SegmentFactory[],
	opts: ComposeOptions = {},
): Gesture {
	const seed = opts.seed ?? randomSeed();
	const target = opts.target ?? grabTarget;
	const start = opts.start;
	const built = buildSegments(
		seed,
		start ?? { x: 0, y: 0 },
		factories,
	);
	return {
		seed,
		start: start ?? { x: 0, y: 0 },
		samples: built.samples,
		segments: built.segments,
		target,
		grabTarget,
	};
}

export async function play(gesture: Gesture, opts: PlayOptions = {}): Promise<Point> {
	const backend = opts.backend ?? pickBackend({ trusted: opts.trusted, mode: opts.mode });
	const start = gesture.start;
	await backend.begin({
		target: gesture.grabTarget,
		startX: start.x,
		startY: start.y,
	});
	await backend.move(gesture.samples);
	const last = gesture.samples.at(-1);
	const end = last ? { x: last.x, y: last.y } : start;
	await backend.end(end.x, end.y);
	return end;
}

export async function composeAndPlay(
	grabTarget: Element,
	factories: SegmentFactory[],
	opts: ComposeOptions & PlayOptions = {},
): Promise<{ gesture: Gesture; end: Point }> {
	const start = opts.start ?? (await centerOf(grabTarget));
	const gesture = compose(grabTarget, factories, { ...opts, start, grabTarget });
	const end = await play(gesture, opts);
	return { gesture, end };
}

export type HumanDragBuilder = {
	seed(seed: number): HumanDragBuilder;
	mode(mode: PlayMode): HumanDragBuilder;
	trusted(v?: boolean): HumanDragBuilder;
	segments(...factories: SegmentFactory[]): HumanDragBuilder;
	run(): Promise<{ gesture: Gesture; end: Point }>;
};

export function humanDrag(el: ElementLike): HumanDragBuilder {
	let seed = randomSeed();
	let mode: PlayMode = 'fast';
	let trusted = false;
	let factories: SegmentFactory[] = [];
	let grabEl: Element | null = null;

	const builder: HumanDragBuilder = {
		seed(s) {
			seed = s;
			return builder;
		},
		mode(m) {
			mode = m;
			return builder;
		},
		trusted(v = true) {
			trusted = v;
			return builder;
		},
		segments(...f) {
			factories = f;
			return builder;
		},
		async run() {
			grabEl = await resolveElement(el);
			const start = await centerOf(grabEl);
			return composeAndPlay(grabEl, factories, { seed, start, mode, trusted, grabTarget: grabEl });
		},
	};
	return builder;
}

export { createRng, randomSeed };
