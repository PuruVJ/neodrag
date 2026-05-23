const POINTER_ID = 1;

function patchPointerCapture() {
	const proto = HTMLElement.prototype;
	const prevSet = proto.setPointerCapture;
	const prevRelease = proto.releasePointerCapture;
	const prevHas = proto.hasPointerCapture;
	proto.setPointerCapture = function () {};
	proto.releasePointerCapture = function () {};
	proto.hasPointerCapture = function () {
		return false;
	};
	return () => {
		proto.setPointerCapture = prevSet;
		proto.releasePointerCapture = prevRelease;
		proto.hasPointerCapture = prevHas;
	};
}

function pointerEvent(
	type: string,
	target: EventTarget,
	x: number,
	y: number,
	extra: PointerEventInit = {},
): PointerEvent {
	return new PointerEvent(type, {
		bubbles: true,
		cancelable: true,
		pointerId: POINTER_ID,
		pointerType: 'mouse',
		isPrimary: true,
		clientX: x,
		clientY: y,
		screenX: x,
		screenY: y,
		button: type === 'pointerup' ? 0 : 0,
		buttons: type === 'pointerdown' ? 1 : type === 'pointerup' ? 0 : 1,
		...extra,
	});
}

export interface DragStepsOptions {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	steps?: number;
}

export function simulateDragSteps(
	target: HTMLElement,
	{ fromX, fromY, toX, toY, steps = 12 }: DragStepsOptions,
) {
	const restore = patchPointerCapture();
	try {
		target.dispatchEvent(pointerEvent('pointermove', target, fromX, fromY));
		target.dispatchEvent(pointerEvent('pointerdown', target, fromX, fromY));
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const x = fromX + (toX - fromX) * t;
			const y = fromY + (toY - fromY) * t;
			target.dispatchEvent(pointerEvent('pointermove', target, x, y));
		}
		target.dispatchEvent(pointerEvent('pointerup', target, toX, toY));
	} finally {
		restore();
	}
}
