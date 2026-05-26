import { KeyboardMoveSensor } from './keyboard-move-sensor.ts';
import { KeyboardSensor } from './keyboard-sensor.ts';
import { PointerSensor } from './pointer-sensor.ts';
import type { Sensor } from './types.ts';

export function installDefaultSensors(register: (sensor: Sensor) => void): void {
	register(new PointerSensor());
	register(new KeyboardSensor());
	register(new KeyboardMoveSensor());
}
