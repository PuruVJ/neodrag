import { resolveSizeInput, sizeContext } from './length-contract.ts';
import type { LengthAdapter } from './length-runtime.ts';
import type { SizeInput } from './length-runtime.ts';
import { isPointerInput, type InteractionInput } from './interaction-input.ts';

export type DragThresholdOptions = {
	delay?: number;
	distance?: SizeInput;
};

export type ResolvedDragThreshold =
	| { enabled: false }
	| { enabled: true; delayMs: number; distancePx: number };

export type DragThresholdInput = DragThresholdOptions | null | undefined;

export const DEFAULT_DRAG_THRESHOLD: DragThresholdOptions = {
	distance: 3,
	delay: 0,
};

export function resolveDragThreshold(
	input: DragThresholdInput,
	rootNode: HTMLElement | SVGElement,
	length: LengthAdapter,
): ResolvedDragThreshold {
	if (input === null) return { enabled: false };

	const opts = input ?? DEFAULT_DRAG_THRESHOLD;
	const delayMs = opts.delay ?? 0;
	if (delayMs < 0) throw new Error('delay must be >= 0');

	const distancePx = resolveSizeInput(
		length,
		opts.distance ?? 3,
		sizeContext(rootNode, 'width'),
		3,
	);
	if (distancePx < 0) throw new Error('distance must be >= 0');

	return { enabled: true, delayMs, distancePx };
}

export type DragThresholdSample = {
	started: boolean;
	startTime: number;
	startX: number;
	startY: number;
};

export function createThresholdSample(): DragThresholdSample {
	return { started: false, startTime: 0, startX: 0, startY: 0 };
}

export function resetThresholdSample(sample: DragThresholdSample): void {
	sample.started = false;
	sample.startTime = 0;
	sample.startX = 0;
	sample.startY = 0;
}

export function passesDragThreshold(
	config: ResolvedDragThreshold,
	sample: DragThresholdSample,
	ctx: {
		rootNode: HTMLElement | SVGElement;
		isDragging: boolean;
		cancel(): void;
	},
	input: InteractionInput,
): boolean {
	if (!config.enabled) return true;
	if (ctx.isDragging) return true;

	if (input.kind === 'keyboard' || input.kind === 'programmatic') return true;

	if (!isPointerInput(input)) return true;

	const event = input.native;

	if (!sample.started) {
		if (!ctx.rootNode.contains(event.target as Node)) {
			ctx.cancel();
			return false;
		}
		sample.started = true;
		sample.startTime = Date.now();
		sample.startX = input.clientX;
		sample.startY = input.clientY;
	}

	if (config.delayMs > 0 && Date.now() - sample.startTime < config.delayMs) return false;

	if (config.distancePx > 0) {
		const dx = input.clientX - sample.startX;
		const dy = input.clientY - sample.startY;
		if (dx * dx + dy * dy <= config.distancePx ** 2) return false;
	}

	return true;
}
