import type { InteractionInput } from '../interaction-input.ts';
import type { EndReason } from '../types.ts';

export interface SensorHost {
	getDelegate(): HTMLElement;
	setPointerDisarm(disarm: (() => void) | null): void;
	onInteractionStart(input: InteractionInput): void;
	onInteractionMove(input: InteractionInput): void;
	onInteractionEnd(input: InteractionInput): void;
	cancelActive(reason: EndReason): void;
}

export interface Sensor {
	readonly key: symbol;
	setup(host: SensorHost): () => void;
}

export interface PointerSensorOptions {
	/** Mouse buttons that may start an interaction (0 = left). Default: [0] */
	buttons?: number[];
}

export interface KeyboardSensorOptions {
	/** Keys that cancel the active interaction. Default: ['Escape'] */
	cancelKeys?: string[];
}
