import { nativeDragToInput } from '../interaction-input.ts';
import { listen } from '../utils.ts';
import { SensorBase } from './base.ts';
import type { SensorHost } from './types.ts';

export const NATIVE_DND_SENSOR_KEY = Symbol('neodrag.sensor.native-dnd');

/**
 * Bridges the browser's native OS drag-and-drop (files / selected text) into the engine as a
 * `native-dnd` interaction. `dragover` must `preventDefault()` or the browser never fires `drop`.
 * A dragenter/dragleave depth counter distinguishes moving *between* elements (which fires both)
 * from actually leaving the document — only the latter ends the interaction.
 */
export class NativeDndSensor extends SensorBase {
	static readonly key = NATIVE_DND_SENSOR_KEY;
	readonly key = NativeDndSensor.key;

	protected attach(host: SensorHost): () => void {
		const target = host.getDelegate();
		let depth = 0;

		const hasPayload = (e: DragEvent) => !!e.dataTransfer && e.dataTransfer.types.length > 0;

		const onEnter = (e: DragEvent) => {
			if (!hasPayload(e)) return;
			e.preventDefault();
			depth += 1;
			if (depth === 1) host.onInteractionStart(nativeDragToInput(e, 'start'));
		};
		const onOver = (e: DragEvent) => {
			if (depth === 0 || !e.dataTransfer) return;
			e.preventDefault(); // required so the browser dispatches `drop`
			host.onInteractionMove(nativeDragToInput(e, 'move'));
		};
		const onLeave = (e: DragEvent) => {
			if (depth === 0) return;
			depth -= 1;
			if (depth === 0) host.cancelActive('cancel');
		};
		const onDrop = (e: DragEvent) => {
			if (depth === 0) return;
			e.preventDefault();
			depth = 0;
			host.onInteractionEnd(nativeDragToInput(e, 'end'));
		};

		const offs = [
			listen(target, 'dragenter', onEnter, { passive: false, capture: true }),
			listen(target, 'dragover', onOver, { passive: false, capture: true }),
			listen(target, 'dragleave', onLeave, { passive: true, capture: true }),
			listen(target, 'drop', onDrop, { passive: false, capture: true }),
		];
		return () => offs.forEach((off) => off());
	}
}
