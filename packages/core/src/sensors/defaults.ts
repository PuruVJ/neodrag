import { keyboardMoveSensor } from './keyboard-move.ts';
import { keyboardSensor } from './keyboard.ts';
import { pointerSensor } from './pointer.ts';
import type { Sensor } from './types.ts';

export function defaultSensors(): Sensor[] {
	return [pointerSensor(), keyboardSensor(), keyboardMoveSensor()];
}
