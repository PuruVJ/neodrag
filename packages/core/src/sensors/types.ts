import type { EndReason } from '../types.ts';

export interface SensorHost {
	getDelegate(): HTMLElement;
	/** Pointer sensor registers disarm so the engine can release move/up listeners on cancel. */
	setPointerDisarm(disarm: (() => void) | null): void;
	onPointerDown(event: PointerEvent): void;
	onPointerMove(event: PointerEvent): void;
	onPointerUp(event: PointerEvent): void;
	cancelActive(reason: EndReason): void;
}

export interface Sensor {
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
