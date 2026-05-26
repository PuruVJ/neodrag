import type { InteractionInput } from './interaction-input.ts';
import type { ActiveSession } from './instance.ts';
import type { DropCtxHost } from './instance.ts';

export function syncDragSessionPointer(
	input: InteractionInput,
	inst: { lastInput: InteractionInput | null },
	active: ActiveSession | null,
	dropHost: DropCtxHost,
): void {
	inst.lastInput = input;
	const x = input.clientX;
	const y = input.clientY;
	if (active) {
		active.pointerX = x;
		active.pointerY = y;
	}
	dropHost.lastInput = input;
	dropHost.pointerX = x;
	dropHost.pointerY = y;
}

export function syncResizeSessionPointer(
	input: InteractionInput,
	inst: { lastInput: InteractionInput | null },
	active: { pointerX: number; pointerY: number } | null,
): void {
	inst.lastInput = input;
	if (active) {
		active.pointerX = input.clientX;
		active.pointerY = input.clientY;
	}
}
