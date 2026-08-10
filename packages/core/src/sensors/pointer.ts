import { pointerToInput } from '../interaction-input.ts';
import { listen } from '../utils.ts';
import { SensorBase } from './base.ts';
import type { PointerSensorOptions, SensorHost } from './types.ts';

export const POINTER_SENSOR_KEY = Symbol('neodrag.sensor.pointer');

export class PointerSensor extends SensorBase {
	static readonly key = POINTER_SENSOR_KEY;
	readonly key = PointerSensor.key;
	readonly #buttons: number[];

	constructor(options: PointerSensorOptions | null = {}) {
		super();
		this.#buttons = options?.buttons ?? [0];
	}

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();
		let armed = false;
		let move_up_abort: AbortController | null = null;

		const disarm = () => {
			move_up_abort?.abort();
			move_up_abort = null;
			armed = false;
		};

		host.setPointerDisarm(disarm);

		const arm = () => {
			if (armed) return;
			armed = true;
			const signal = (move_up_abort = new AbortController()).signal;
			listen(target, 'pointermove', (e) => host.onInteractionMove(pointerToInput(e, 'move')), {
				passive: false,
				capture: true,
				signal,
			});
			const on_up = (e: PointerEvent) => {
				disarm();
				host.onInteractionEnd(pointerToInput(e, 'end'));
			};
			listen(target, 'pointerup', on_up, { passive: true, capture: true, signal });
			listen(target, 'pointercancel', on_up, { passive: true, capture: true, signal });
		};

		const on_pointer_down = (e: PointerEvent) => {
			if (!this.#buttons.includes(e.button)) return;
			host.onInteractionStart(pointerToInput(e, 'start'));
			arm();
		};

		const unlisten = listen(target, 'pointerdown', on_pointer_down, {
			passive: true,
			capture: true,
		});

		return () => {
			host.setPointerDisarm(null);
			disarm();
			unlisten();
		};
	}
}
