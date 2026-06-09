export { SensorBase } from './base.ts';
export { PointerSensor, POINTER_SENSOR_KEY } from './pointer.ts';
export { NativeDndSensor, NATIVE_DND_SENSOR_KEY } from './native-dnd.ts';
export {
	KeyboardSensor,
	KEYBOARD_SENSOR_KEY,
	KeyboardMoveSensor,
	KEYBOARD_MOVE_SENSOR_KEY,
	isDraggableKeyboardTarget,
	keyboardDraggable,
	type KeyboardDraggableOptions,
	type KeyboardDraggableHandle,
} from './keyboard.ts';
export { installDefaultSensors } from './defaults.ts';
export type { Sensor, SensorHost, PointerSensorOptions, KeyboardSensorOptions } from './types.ts';

// v3-specific sensor pieces (formerly under `dnd/sensors`).
export {
	GamepadSensor,
	GAMEPAD_SENSOR_KEY,
	type GamepadSensorOptions,
	type GamepadSession,
} from './gamepad.ts';
export {
	allFilters,
	buttonFilter,
	modifierFilter,
	type InputFilter,
} from './filters.ts';
