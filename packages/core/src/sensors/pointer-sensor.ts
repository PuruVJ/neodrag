import { pointerToInput } from '../interaction-input.ts';
import { listen } from '../utils.ts';
import { SensorBase } from './sensor-base.ts';
import type { PointerSensorOptions, SensorHost } from './types.ts';

export const POINTER_SENSOR_KEY = Symbol('neodrag.sensor.pointer');

export class PointerSensor extends SensorBase {
	readonly key = POINTER_SENSOR_KEY;
	readonly #buttons: number[];

	constructor(options: PointerSensorOptions | null = {}) {
		super();
		this.#buttons = options?.buttons ?? [0];
	}

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();
		let armed = false;
		let moveUpAbort: AbortController | null = null;

		const disarm = () => {
			moveUpAbort?.abort();
			moveUpAbort = null;
			armed = false;
		};

		host.setPointerDisarm(disarm);

		const arm = () => {
			if (armed) return;
			armed = true;
			const signal = (moveUpAbort = new AbortController()).signal;
			listen(target, 'pointermove', (e) => host.onInteractionMove(pointerToInput(e, 'move')), {
				passive: false,
				capture: true,
				signal,
			});
			const onUp = (e: PointerEvent) => {
				disarm();
				host.onInteractionEnd(pointerToInput(e, 'end'));
			};
			listen(target, 'pointerup', onUp, { passive: true, capture: true, signal });
			listen(target, 'pointercancel', onUp, { passive: true, capture: true, signal });
		};

		const onPointerDown = (e: PointerEvent) => {
			if (!this.#buttons.includes(e.button)) return;
			host.onInteractionStart(pointerToInput(e, 'start'));
			arm();
		};

		listen(target, 'pointerdown', onPointerDown, { passive: true, capture: true });

		return () => {
			host.setPointerDisarm(null);
			disarm();
			target.removeEventListener('pointerdown', onPointerDown, { capture: true });
		};
	}
}

export function pointerSensor(options: PointerSensorOptions | null = {}): PointerSensor {
	return new PointerSensor(options);
}
