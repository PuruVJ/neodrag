/**
 * Mouse/pointer simulation helpers for browser tests.
 *
 * Everything here dispatches real DOM events in-browser — no Playwright-side custom commands, no
 * `@vitest/browser/context` augmentation. Pointer drags go through `dispatchPointer`; the `mouse*`
 * helpers synthesize `MouseEvent`s the same way. A module-level virtual cursor tracks position so
 * `mouseMove`/`getCursorPosition` interpolate from where the last event left it.
 */

/**
 * Mouse button options for mouse events
 */
export type MouseButton = 'left' | 'right' | 'middle';

/**
 * Virtual cursor position, advanced by every helper that dispatches a positioned event.
 */
let currentCursorPosition = { x: 0, y: 0 };
let isTrackingCursor = false;

export interface MouseOptions {
	/** The x-coordinate relative to the viewport */
	x: number;
	/** The y-coordinate relative to the viewport */
	y: number;
	/** Mouse button to use (default: 'left') */
	button?: MouseButton;
	/** Additional options for the mouse event */
	options?: {
		/** Delay between mouse down and up in milliseconds */
		delay?: number;
	};
}

export interface MouseMoveOptions {
	/** The x-coordinate relative to the viewport */
	x: number;
	/** The y-coordinate relative to the viewport */
	y: number;
	/** Number of steps to interpolate the movement (default: 1) */
	steps?: number;
}

function updateCursorPosition(x: number, y: number): void {
	currentCursorPosition = { x, y };
}

/**
 * Simple click on an element
 * @param element - The element or testing wrapper to click
 * @example
 * await clickElement(buttonLocator)
 * await clickElement(getByTestId('submit-btn'))
 */
export async function clickElement(element: Element | { element(): Element }): Promise<void> {
	const coords = await getElementCoords(element);
	await mouseClick({ x: coords.x, y: coords.y });
}

/**
 * Start cursor tracking. The virtual cursor is advanced directly by each helper, but listening to
 * real `mousemove`/`mouseenter` keeps it in sync with any events the test fires itself.
 */
export function startCursorTracking(): void {
	if (isTrackingCursor) return;
	isTrackingCursor = true;

	document.addEventListener(
		'mousemove',
		(event) => updateCursorPosition(event.clientX, event.clientY),
		{ passive: true },
	);
	document.addEventListener(
		'mouseenter',
		(event) => updateCursorPosition(event.clientX, event.clientY),
		{ passive: true },
	);
}

export function stopCursorTracking(): void {
	isTrackingCursor = false;
}

/**
 * Get the current (virtual) cursor position.
 * @example
 * const position = await getCursorPosition()
 */
export async function getCursorPosition(): Promise<{ x: number; y: number }> {
	return { ...currentCursorPosition };
}

/**
 * Get cursor position relative to a specific element
 */
export async function getCursorPositionRelativeToElement(
	element: Element,
): Promise<{ x: number; y: number }> {
	const cursorPos = await getCursorPosition();
	const rect = element.getBoundingClientRect();

	return {
		x: cursorPos.x - rect.left,
		y: cursorPos.y - rect.top,
	};
}

/**
 * Check if cursor is currently over an element
 */
export async function isCursorOverElement(element: Element): Promise<boolean> {
	const cursorPos = await getCursorPosition();
	const rect = element.getBoundingClientRect();

	return (
		cursorPos.x >= rect.left &&
		cursorPos.x <= rect.right &&
		cursorPos.y >= rect.top &&
		cursorPos.y <= rect.bottom
	);
}

/**
 * Get element coordinates (center) for mouse events. Handles both raw DOM elements and testing
 * library wrappers exposing an `element()` method.
 * @example
 * const coords = await getElementCoords(page.getByRole('button'))
 * await mouseClick(coords)
 */
export async function getElementCoords(
	element: Element | { element(): Element | Promise<Element> },
): Promise<{ x: number; y: number }> {
	const domElement =
		'element' in element && typeof element.element === 'function'
			? await element.element()
			: (element as Element);

	if (!domElement || typeof domElement.getBoundingClientRect !== 'function') {
		throw new Error(
			'Invalid element provided to getElementCoords. Expected DOM Element or testing wrapper with element() method.',
		);
	}

	const rect = domElement.getBoundingClientRect();
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

/**
 * Dispatch a mouse event at viewport coordinates, targeting whatever element sits at that point.
 */
function dispatchMouseEvent(
	type: 'mousedown' | 'mouseup' | 'mousemove' | 'click',
	x: number,
	y: number,
	button: MouseButton = 'left',
): void {
	const buttonCode = button === 'left' ? 0 : button === 'right' ? 2 : 1;

	const event = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		clientX: x,
		clientY: y,
		button: buttonCode,
		buttons: type === 'mouseup' ? 0 : 1 << buttonCode,
		view: window,
	});

	const elementAtPoint = document.elementFromPoint(x, y);
	(elementAtPoint ?? document).dispatchEvent(event);
}

/**
 * Mouse down on an element (at its center).
 * @example
 * await mouseDown(buttonLocator)
 * await mouseDown(buttonLocator, 'right')
 */
export async function mouseDown(
	element: Element | { element(): Element },
	button: MouseButton = 'left',
): Promise<void> {
	const coords = await getElementCoords(element);
	updateCursorPosition(coords.x, coords.y);
	dispatchMouseEvent('mousedown', coords.x, coords.y, button);
}

/**
 * Mouse up on an element (at its center).
 * @example
 * await mouseUp(buttonLocator)
 */
export async function mouseUp(
	element: Element | { element(): Element },
	button: MouseButton = 'left',
): Promise<void> {
	const coords = await getElementCoords(element);
	updateCursorPosition(coords.x, coords.y);
	dispatchMouseEvent('mouseup', coords.x, coords.y, button);
}

/**
 * Move the cursor by a delta from its current position, optionally interpolated over `steps`.
 * @example
 * await mouseMove(100, 50) // Move 100px right, 50px down
 * await mouseMove(-50, 0, 10) // Move 50px left with 10 smooth steps
 */
export async function mouseMove(deltaX: number, deltaY: number, steps: number = 1): Promise<void> {
	const currentPos = await getCursorPosition();
	const targetX = currentPos.x + deltaX;
	const targetY = currentPos.y + deltaY;

	if (steps <= 1) {
		dispatchMouseEvent('mousemove', targetX, targetY);
		updateCursorPosition(targetX, targetY);
		return;
	}

	const stepDeltaX = deltaX / steps;
	const stepDeltaY = deltaY / steps;
	for (let i = 1; i <= steps; i++) {
		const nextX = Math.round(currentPos.x + stepDeltaX * i);
		const nextY = Math.round(currentPos.y + stepDeltaY * i);
		dispatchMouseEvent('mousemove', nextX, nextY);
		updateCursorPosition(nextX, nextY);
		await new Promise((resolve) => setTimeout(resolve, 16)); // ~60fps
	}
}

/**
 * Full click sequence (move → down → up → click) at viewport coordinates.
 * @example
 * await mouseClick({ x: 100, y: 200 })
 * await mouseClick({ x: 100, y: 200, button: 'right' })
 */
export async function mouseClick(options: MouseOptions): Promise<void> {
	const { x, y, button = 'left', options: extraOptions } = options;
	updateCursorPosition(x, y);

	dispatchMouseEvent('mousemove', x, y);
	dispatchMouseEvent('mousedown', x, y, button);

	if (extraOptions?.delay) {
		await new Promise((resolve) => setTimeout(resolve, extraOptions.delay));
	}

	dispatchMouseEvent('mouseup', x, y, button);
	dispatchMouseEvent('click', x, y, button);
}

/**
 * Double click at viewport coordinates.
 * @example
 * await mouseDoubleClick({ x: 100, y: 200 })
 */
export async function mouseDoubleClick(options: Omit<MouseOptions, 'clickCount'>): Promise<void> {
	const { x, y, button = 'left' } = options;
	updateCursorPosition(x, y);

	await mouseClick({ x, y, button });
	await new Promise((resolve) => setTimeout(resolve, 10));
	await mouseClick({ x, y, button });
}

/**
 * Simple drag and drop - disable pointer capture to avoid Firefox issues
 * Now supports long press functionality
 */
export type PointerDragOptions = {
	steps?: number;
	delay?: number;
	longpress?: number;
	/** When false, keeps the pointer down after the last move (for mid-drag assertions). */
	release?: boolean;
};

async function resolveDragElement(
	element: Element | { element(): Element | Promise<Element> },
): Promise<Element> {
	if ('element' in element && typeof element.element === 'function') {
		return element.element();
	}
	return element as Element;
}

export function dispatchPointer(
	target: Element,
	type: string,
	x: number,
	y: number,
	buttons: number,
) {
	const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
	const validPointerId = isFirefox ? 0 : 1;
	const props = {
		bubbles: true,
		cancelable: true,
		pointerId: validPointerId,
		width: 1,
		height: 1,
		pressure: buttons ? 0.5 : 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 'mouse' as const,
		isPrimary: true,
		view: window,
		clientX: x,
		clientY: y,
		screenX: x,
		screenY: y,
		button: 0,
		buttons,
	};
	const event = new PointerEvent(type, props);
	target.dispatchEvent(event);
	document.documentElement.dispatchEvent(event);
}

/**
 * Pointer drag with optional hold (no pointerup) for testing in-flight drag/drop/sortable state.
 */
export async function pointerDrag(
	element: Element | { element(): Element },
	delta: { deltaX: number; deltaY: number },
	options: PointerDragOptions = {},
): Promise<{ x: number; y: number }> {
	const { steps = 8, delay = 0, longpress = 0, release = true } = options;
	const domElement = await resolveDragElement(element);
	const origin = await getElementCoords(element);
	const startCoords = { x: origin.x, y: origin.y };
	const endCoords = {
		x: startCoords.x + delta.deltaX,
		y: startCoords.y + delta.deltaY,
	};

	const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
	const originalSetPointerCapture = HTMLElement.prototype.setPointerCapture;
	const originalReleasePointerCapture = HTMLElement.prototype.releasePointerCapture;

	if (isFirefox) {
		HTMLElement.prototype.setPointerCapture = function () {};
		HTMLElement.prototype.releasePointerCapture = function () {};
	}

	try {
		dispatchPointer(domElement, 'pointermove', startCoords.x, startCoords.y, 0);
		await new Promise((resolve) => setTimeout(resolve, 1));

		dispatchPointer(domElement, 'pointerdown', startCoords.x, startCoords.y, 1);

		if (longpress > 0) {
			await new Promise((resolve) => setTimeout(resolve, longpress));
		}
		if (delay > 0) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		for (let i = 1; i <= steps; i++) {
			const progress = i / steps;
			const x = startCoords.x + delta.deltaX * progress;
			const y = startCoords.y + delta.deltaY * progress;
			dispatchPointer(domElement, 'pointermove', x, y, 1);
			await new Promise((resolve) => setTimeout(resolve, 1));
		}

		if (release) {
			await new Promise((resolve) => setTimeout(resolve, 1));
			dispatchPointer(domElement, 'pointerup', endCoords.x, endCoords.y, 0);
		}

		updateCursorPosition(endCoords.x, endCoords.y);
		return endCoords;
	} finally {
		HTMLElement.prototype.setPointerCapture = originalSetPointerCapture;
		HTMLElement.prototype.releasePointerCapture = originalReleasePointerCapture;
	}
}

/** Move the held pointer to viewport coordinates (during an active pointerDrag with release: false). */
export async function pointerMoveTo(x: number, y: number, steps = 1): Promise<void> {
	const start = await getCursorPosition();
	const deltaX = x - start.x;
	const deltaY = y - start.y;
	for (let i = 1; i <= steps; i++) {
		const progress = i / steps;
		const cx = start.x + deltaX * progress;
		const cy = start.y + deltaY * progress;
		dispatchPointer(document.documentElement, 'pointermove', cx, cy, 1);
		await new Promise((resolve) => setTimeout(resolve, 1));
	}
	updateCursorPosition(x, y);
}

export async function pointerRelease(x?: number, y?: number): Promise<void> {
	const pos = x != null && y != null ? { x, y } : await getCursorPosition();
	dispatchPointer(document.documentElement, 'pointerup', pos.x, pos.y, 0);
	updateCursorPosition(pos.x, pos.y);
}

export async function dragAndDrop(
	element: Element | { element(): Element },
	delta: { deltaX: number; deltaY: number },
	options: {
		steps?: number;
		delay?: number;
		longpress?: number;
	} = {},
): Promise<void> {
	await pointerDrag(element, delta, { ...options, release: true });
}

/**
 * Drive an element with arrow keys (for libraries supporting keyboard navigation).
 */
export async function dragUsingKeyboard(
	element: Element | { element(): Element },
	delta: { deltaX: number; deltaY: number },
): Promise<void> {
	const domElement =
		'element' in element && typeof element.element === 'function'
			? element.element()
			: (element as Element);

	if (!domElement.hasAttribute('tabindex')) {
		(domElement as HTMLElement).setAttribute('tabindex', '0');
	}
	(domElement as HTMLElement).focus();

	for (let i = 0; i < Math.abs(delta.deltaX); i++) {
		const key = delta.deltaX > 0 ? 'ArrowRight' : 'ArrowLeft';
		domElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	for (let i = 0; i < Math.abs(delta.deltaY); i++) {
		const key = delta.deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
		domElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 10));
	}
}

/**
 * Mouse wheel scroll at viewport coordinates.
 * @example
 * await mouseWheel({ x: 100, y: 200, deltaX: 0, deltaY: -100 }) // Scroll up
 */
export async function mouseWheel(options: {
	x: number;
	y: number;
	deltaX: number;
	deltaY: number;
}): Promise<void> {
	const { x, y, deltaX, deltaY } = options;
	updateCursorPosition(x, y);

	const wheelEvent = new WheelEvent('wheel', {
		bubbles: true,
		cancelable: true,
		clientX: x,
		clientY: y,
		deltaX,
		deltaY,
		view: window,
	});

	const elementAtPoint = document.elementFromPoint(x, y);
	(elementAtPoint ?? document).dispatchEvent(wheelEvent);
}
