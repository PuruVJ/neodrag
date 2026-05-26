import { KeyboardMoveSensor } from './keyboard-move-sensor.ts';
import { KeyboardSensor } from './keyboard-sensor.ts';
import { PointerSensor } from './pointer-sensor.ts';
import type { Sensor } from './types.ts';

export function defaultSensors(): Sensor[] {
	return [new PointerSensor(), new KeyboardSensor(), new KeyboardMoveSensor()];
}
