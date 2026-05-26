import { pointerToInput } from '../interaction-input.ts';
import { listen } from '../utils.ts';
import type { PointerSensorOptions, Sensor, SensorHost } from './types.ts';

const POINTER_SENSOR_KEY = Symbol('neodrag.sensor.pointer');

export function pointerSensor(options: PointerSensorOptions | null = {}): Sensor & { key: symbol } {
	const buttons = options?.buttons ?? [0];
	return {
		key: POINTER_SENSOR_KEY,

		setup(host) {
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
				if (!buttons.includes(e.button)) return;
				host.onInteractionStart(pointerToInput(e, 'start'));
				arm();
			};

			listen(target, 'pointerdown', onPointerDown, { passive: true, capture: true });

			return () => {
				host.setPointerDisarm(null);
				disarm();
				target.removeEventListener('pointerdown', onPointerDown, { capture: true });
			};
		},
	};
}
