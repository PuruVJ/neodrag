import { listen } from '../utils.ts';
import { SensorBase } from './sensor-base.ts';
import type { KeyboardSensorOptions, SensorHost } from './types.ts';

export const KEYBOARD_SENSOR_KEY = Symbol('neodrag.sensor.keyboard');

export class KeyboardSensor extends SensorBase {
	readonly key = KEYBOARD_SENSOR_KEY;
	readonly #cancelKeys: Set<string>;

	constructor(options: KeyboardSensorOptions | null = {}) {
		super();
		this.#cancelKeys = new Set(options?.cancelKeys ?? ['Escape']);
	}

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();

		const onKeyDown = (e: KeyboardEvent) => {
			if (!this.#cancelKeys.has(e.key)) return;
			host.cancelActive('cancel');
		};

		listen(target, 'keydown', onKeyDown, { passive: true });

		return () => {
			target.removeEventListener('keydown', onKeyDown);
		};
	}
}
