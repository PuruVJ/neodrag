import { nativePointerEvent } from './interaction-input.ts';
import type { InteractionInput } from './interaction-input.ts';
import type { DragInstance, DropCtxHost } from './instance.ts';
import type { ResizeInstance } from './resize-instance.ts';

export function setDragLastInteraction(inst: DragInstance, input: InteractionInput): void {
	inst.lastInput = input;
	inst.lastEvent = nativePointerEvent(input);
}

export function setDropHostLastInteraction(host: DropCtxHost, input: InteractionInput): void {
	host.lastInput = input;
	host.lastEvent = nativePointerEvent(input);
}

export function setResizeLastInteraction(inst: ResizeInstance, input: InteractionInput): void {
	inst.lastInput = input;
	inst.lastEvent = nativePointerEvent(input);
}
