import type { SensorHost } from './sensors/types.ts';

export type InteractionKind = 'pointer' | 'keyboard' | 'programmatic' | 'native-dnd';
export type InteractionPhase = 'start' | 'move' | 'end';

export const KEYBOARD_POINTER_ID = -1;
export const NATIVE_POINTER_ID = -2;

export type InteractionModifiers = Readonly<{
	shift: boolean;
	ctrl: boolean;
	alt: boolean;
	meta: boolean;
}>;

export type InteractionPointerMeta = Readonly<{
	pointerId: number;
	pointerType: PointerEvent['pointerType'];
	button: number;
	buttons: number;
	pressure?: number;
}>;

export type InteractionKeyboardMeta = Readonly<{
	key: string;
	code: string;
	repeat: boolean;
}>;

export interface InteractionInputBase {
	readonly phase: InteractionPhase;
	readonly clientX: number;
	readonly clientY: number;
	readonly target: EventTarget | null;
	readonly modifiers: InteractionModifiers;
	readonly timestamp: number;
	readonly delta?: Readonly<{ x: number; y: number }>;
}

export type PointerInteractionInput = InteractionInputBase & {
	readonly kind: 'pointer';
	readonly native: PointerEvent;
	readonly pointer: InteractionPointerMeta;
};

export type KeyboardInteractionInput = InteractionInputBase & {
	readonly kind: 'keyboard';
	readonly native: KeyboardEvent | null;
	readonly keyboard: InteractionKeyboardMeta;
	readonly pointerId: number;
};

export type ProgrammaticInteractionInput = InteractionInputBase & {
	readonly kind: 'programmatic';
	readonly pointerId: number;
	readonly source?: string;
};

/** An OS drag-and-drop (files/text) routed through the engine by the native-DnD sensor. There is
 * no draggable node — `dataTransfer` carries the payload (readable only on the `drop` phase). */
export type NativeDndInteractionInput = InteractionInputBase & {
	readonly kind: 'native-dnd';
	readonly native: DragEvent;
	readonly dataTransfer: DataTransfer | null;
	readonly pointerId: number;
};

export type InteractionInput =
	| PointerInteractionInput
	| KeyboardInteractionInput
	| ProgrammaticInteractionInput
	| NativeDndInteractionInput;

function modifiersFrom(
	shift: boolean,
	ctrl: boolean,
	alt: boolean,
	meta: boolean,
): InteractionModifiers {
	return { shift, ctrl, alt, meta };
}

export function modifiersFromPointer(e: PointerEvent): InteractionModifiers {
	return modifiersFrom(e.shiftKey, e.ctrlKey, e.altKey, e.metaKey);
}

export function modifiersFromKeyboard(e: KeyboardEvent): InteractionModifiers {
	return modifiersFrom(e.shiftKey, e.ctrlKey, e.altKey, e.metaKey);
}

export function pointerToInput(
	native: PointerEvent,
	phase: InteractionPhase,
	delta?: { x: number; y: number },
): PointerInteractionInput {
	return {
		kind: 'pointer',
		phase,
		clientX: native.clientX,
		clientY: native.clientY,
		target: native.target,
		modifiers: modifiersFromPointer(native),
		timestamp: native.timeStamp,
		delta,
		native,
		pointer: {
			pointerId: native.pointerId,
			pointerType: native.pointerType,
			button: native.button,
			buttons: native.buttons,
			pressure: native.pressure,
		},
	};
}

export function keyboardToInput(opts: {
	phase: InteractionPhase;
	clientX: number;
	clientY: number;
	key: string;
	code?: string;
	repeat?: boolean;
	delta?: { x: number; y: number };
	target?: EventTarget | null;
	native?: KeyboardEvent | null;
	modifiers?: Partial<InteractionModifiers>;
	pointerId?: number;
	timestamp?: number;
}): KeyboardInteractionInput {
	const native = opts.native ?? null;
	const modifiers = opts.modifiers
		? {
				shift: opts.modifiers.shift ?? false,
				ctrl: opts.modifiers.ctrl ?? false,
				alt: opts.modifiers.alt ?? false,
				meta: opts.modifiers.meta ?? false,
			}
		: native
			? modifiersFromKeyboard(native)
			: modifiersFrom(false, false, false, false);

	return {
		kind: 'keyboard',
		phase: opts.phase,
		clientX: opts.clientX,
		clientY: opts.clientY,
		target: opts.target ?? native?.target ?? null,
		modifiers,
		timestamp: opts.timestamp ?? native?.timeStamp ?? performance.now(),
		delta: opts.delta,
		native,
		keyboard: {
			key: opts.key,
			code: opts.code ?? native?.code ?? opts.key,
			repeat: opts.repeat ?? native?.repeat ?? false,
		},
		pointerId: opts.pointerId ?? KEYBOARD_POINTER_ID,
	};
}

export function programmaticToInput(opts: {
	phase: InteractionPhase;
	clientX: number;
	clientY: number;
	pointerId?: number;
	delta?: { x: number; y: number };
	target?: EventTarget | null;
	source?: string;
	timestamp?: number;
}): ProgrammaticInteractionInput {
	return {
		kind: 'programmatic',
		phase: opts.phase,
		clientX: opts.clientX,
		clientY: opts.clientY,
		target: opts.target ?? null,
		modifiers: modifiersFrom(false, false, false, false),
		timestamp: opts.timestamp ?? performance.now(),
		delta: opts.delta,
		pointerId: opts.pointerId ?? KEYBOARD_POINTER_ID,
		source: opts.source,
	};
}

export function nativeDragToInput(native: DragEvent, phase: InteractionPhase): NativeDndInteractionInput {
	return {
		kind: 'native-dnd',
		phase,
		clientX: native.clientX,
		clientY: native.clientY,
		target: native.target,
		modifiers: modifiersFrom(native.shiftKey, native.ctrlKey, native.altKey, native.metaKey),
		timestamp: native.timeStamp,
		native,
		dataTransfer: native.dataTransfer,
		pointerId: NATIVE_POINTER_ID,
	};
}

/** The OS-drop payload — readable only on `drop` (the spec hides file/text content during hover). */
export function nativeDropFiles(dt: DataTransfer | null): File[] {
	return dt ? Array.from(dt.files) : [];
}
export function nativeDropText(dt: DataTransfer | null): string {
	if (!dt) return '';
	return dt.getData('text/plain') || dt.getData('text/uri-list') || dt.getData('text') || '';
}

export function isNativeDndInput(i: InteractionInput): i is NativeDndInteractionInput {
	return i.kind === 'native-dnd';
}

export function isPointerInput(i: InteractionInput): i is PointerInteractionInput {
	return i.kind === 'pointer';
}

export function isKeyboardInput(i: InteractionInput): i is KeyboardInteractionInput {
	return i.kind === 'keyboard';
}

export function isProgrammaticInput(i: InteractionInput): i is ProgrammaticInteractionInput {
	return i.kind === 'programmatic';
}

export function nativePointerEvent(i: InteractionInput | null | undefined): PointerEvent | null {
	if (!i || i.kind !== 'pointer') return null;
	return i.native;
}

export function interactionPointerId(i: InteractionInput): number {
	if (i.kind === 'pointer') return i.pointer.pointerId;
	return i.pointerId;
}

export function submitInteraction(host: SensorHost, input: InteractionInput): void {
	if (input.phase === 'start') host.onInteractionStart(input);
	else if (input.phase === 'move') host.onInteractionMove(input);
	else host.onInteractionEnd(input);
}
