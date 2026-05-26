import { listen } from '../utils.ts';
import type { KeyboardSensorOptions, Sensor, SensorHost } from './types.ts';

const KEYBOARD_SENSOR_KEY = Symbol('neodrag.sensor.keyboard');

export function keyboardSensor(options: KeyboardSensorOptions | null = {}): Sensor & { key: symbol } {
	const cancelKeys = new Set(options?.cancelKeys ?? ['Escape']);

	return {
		key: KEYBOARD_SENSOR_KEY,

		setup(host) {
			const target = host.getDelegate();

			const onKeyDown = (e: KeyboardEvent) => {
				if (!cancelKeys.has(e.key)) return;
				host.cancelActive('cancel');
			};

			listen(target, 'keydown', onKeyDown, { passive: true });

			return () => {
				target.removeEventListener('keydown', onKeyDown);
			};
		},
	};
}
