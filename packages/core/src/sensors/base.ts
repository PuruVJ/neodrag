import type { Sensor, SensorHost } from './types.ts';

export abstract class SensorBase implements Sensor {
	abstract readonly key: symbol;

	setup(host: SensorHost): () => void {
		return this.attach(host);
	}

	protected abstract attach(host: SensorHost): () => void;
}
