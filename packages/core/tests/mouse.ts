/**
 * TypeScript declarations for our custom commands
 */
declare module '@vitest/browser/context' {
	interface BrowserCommands {
		mouseDown: (x: number, y: number, button?: string) => Promise<void>;
		mouseUp: (x: number, y: number, button?: string) => Promise<void>;
		mouseMove: (x: number, y: number, steps?: number) => Promise<void>;
		mouseClick: (x: number, y: number, button?: string, delay?: number) => Promise<void>;
		mouseDoubleClick: (x: number, y: number, button?: string) => Promise<void>;
		mouseWheel: (deltaX: number, deltaY: number) => Promise<void>;
		getMousePosition: () => Promise<{ x: number; y: number; message?: string }>;
		mouseDragAndDrop: (
			fromX: number,
			fromY: number,
			toX: number,
			toY: number,
			steps?: number,
		) => Promise<void>;
	}
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

// /**
//  * Simple hover over an element
//  * @param element - The element or testing wrapper to hover
//  * @example
//  * await hoverElement(menuItem)
//  */
// export async function hoverElement(element: Element | { element(): Element }): Promise<void> {
// 	const coords = await getElementCoords(element);
// 	await mouseMove({ x: coords.x, y: coords.y });
// }
import { commands } from '@vitest/browser/context';

/**
 * Mouse button options for mouse events
 */
export type MouseButton = 'left' | 'right' | 'middle';

/**
 * Global cursor position tracker
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

/**
 * Check if we're running in Vitest browser mode
 */
function isVitestBrowser(): boolean {
	return typeof commands !== 'undefined' && commands !== null;
}

/**
 * Update the tracked cursor position
 */
function updateCursorPosition(x: number, y: number): void {
	currentCursorPosition = { x, y };

	// Update global position for server-side tracking
	if (typeof window !== 'undefined') {
		(window as any).trackedMousePosition = { x, y };
	}
}

/**
 * Initialize cursor position tracking by listening to mouse events
 * Call this once at the beginning of your test setup
 */
export function startCursorTracking(): void {
	if (isTrackingCursor) return;

	isTrackingCursor = true;

	// Set up global tracking function for server commands to access
	if (typeof window !== 'undefined') {
		(window as any).getTrackedMousePosition = () => ({ ...currentCursorPosition });
	}

	// Listen to mousemove events to track cursor position
	document.addEventListener(
		'mousemove',
		(event) => {
			updateCursorPosition(event.clientX, event.clientY);
		},
		{ passive: true },
	);

	// Listen to mouseenter to get initial position when cursor enters viewport
	document.addEventListener(
		'mouseenter',
		(event) => {
			updateCursorPosition(event.clientX, event.clientY);
		},
		{ passive: true },
	);
}

/**
 * Stop cursor position tracking and remove event listeners
 */
export function stopCursorTracking(): void {
	if (!isTrackingCursor) return;
	isTrackingCursor = false;

	// Clean up global tracking
	if (typeof window !== 'undefined') {
		delete (window as any).getTrackedMousePosition;
		delete (window as any).trackedMousePosition;
	}
}

/**
 * Get the current cursor position on the page
 *
 * @returns Object with x, y coordinates of the current cursor position
 * @example
 * const position = await getCursorPosition()
 * console.log(`Cursor at: ${position.x}, ${position.y}`)
 */
export async function getCursorPosition(): Promise<{ x: number; y: number }> {
	if (isVitestBrowser()) {
		try {
			const result = await commands.getMousePosition();
			if (result && typeof result.x === 'number' && typeof result.y === 'number') {
				return { x: result.x, y: result.y };
			}
		} catch (error) {
			console.warn('getMousePosition command failed, using tracked position:', error);
		}
	}

	return { ...currentCursorPosition };
}

/**
 * Get cursor position relative to a specific element
 *
 * @param element - The element to get relative position for
 * @returns Object with x, y coordinates relative to the element
 * @example
 * const button = await page.getByRole('button').element()
 * const relativePos = await getCursorPositionRelativeToElement(button)
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
 *
 * @param element - The element to check
 * @returns Promise<boolean> - true if cursor is over the element
 * @example
 * const button = await page.getByRole('button').element()
 * const isHovered = await isCursorOverElement(button)
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
 * Helper function to get element coordinates for mouse events
 * Handles both raw DOM elements and testing library wrappers
 *
 * @param element - The element or testing wrapper to get coordinates for
 * @returns Promise with x, y coordinates of the element center
 * @example
 * const button = page.getByRole('button')
 * const coords = await getElementCoords(await button.element())
 * await mouseClick(coords)
 */
export async function getElementCoords(
	element: Element | { element(): Element },
): Promise<{ x: number; y: number }> {
	// Handle testing library wrappers that have an element() method
	const domElement =
		'element' in element && typeof element.element === 'function'
			? element.element()
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
 * Fallback function to dispatch mouse events using DOM APIs
 * This works when custom commands are not available
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

	// Find the element at the coordinates and dispatch the event
	const elementAtPoint = document.elementFromPoint(x, y);
	if (elementAtPoint) {
		elementAtPoint.dispatchEvent(event);
	} else {
		document.dispatchEvent(event);
	}
}

/**
 * Simulate a mouse down event on the specified element
 * Works across all browsers (Chrome, Firefox, Safari) using Vitest commands
 *
 * @param element - The element or testing wrapper to mouse down on
 * @param button - Mouse button to use (default: 'left')
 * @example
 * await mouseDown(buttonLocator)
 * await mouseDown(buttonLocator, 'right')
 */
export async function mouseDown(
	element: Element | { element(): Element },
	button: MouseButton = 'left',
): Promise<void> {
	const coords = await getElementCoords(element);

	// Update tracked position
	updateCursorPosition(coords.x, coords.y);

	if (isVitestBrowser()) {
		try {
			// Use the custom command
			await commands.mouseDown(coords.x, coords.y, button);
			return;
		} catch (error) {
			console.warn('Custom mouseDown command failed, falling back to DOM events:', error);
		}
	}

	// Fallback to DOM event simulation
	dispatchMouseEvent('mousedown', coords.x, coords.y, button);
}

/**
 * Simulate a mouse up event on the specified element
 * Works across all browsers (Chrome, Firefox, Safari) using Vitest commands
 *
 * @param element - The element or testing wrapper to mouse up on
 * @param button - Mouse button to use (default: 'left')
 * @example
 * await mouseUp(buttonLocator)
 * await mouseUp(buttonLocator, 'right')
 */
export async function mouseUp(
	element: Element | { element(): Element },
	button: MouseButton = 'left',
): Promise<void> {
	const coords = await getElementCoords(element);

	// Update tracked position
	updateCursorPosition(coords.x, coords.y);

	if (isVitestBrowser()) {
		try {
			// Use the custom command
			await commands.mouseUp(coords.x, coords.y, button);
			return;
		} catch (error) {
			console.warn('Custom mouseUp command failed, falling back to DOM events:', error);
		}
	}

	// Fallback to DOM event simulation
	dispatchMouseEvent('mouseup', coords.x, coords.y, button);
}

/**
 * Simulate mouse movement by delta coordinates from current position
 * Works across all browsers (Chrome, Firefox, Safari) using Vitest commands
 *
 * @param deltaX - Horizontal movement distance in pixels
 * @param deltaY - Vertical movement distance in pixels
 * @param steps - Number of steps to interpolate the movement (default: 1)
 * @example
 * await mouseMove(100, 50) // Move 100px right, 50px down
 * await mouseMove(-50, 0, 10) // Move 50px left with 10 smooth steps
 */
export async function mouseMove(deltaX: number, deltaY: number, steps: number = 1): Promise<void> {
	const currentPos = await getCursorPosition();
	const targetX = currentPos.x + deltaX;
	const targetY = currentPos.y + deltaY;

	// Update tracked position
	updateCursorPosition(targetX, targetY);

	if (isVitestBrowser()) {
		try {
			// Use the custom command
			await commands.mouseMove(targetX, targetY, steps);
			return;
		} catch (error) {
			console.warn('Custom mouseMove command failed, falling back to DOM events:', error);
		}
	}

	// Fallback to DOM event simulation
	if (steps <= 1) {
		dispatchMouseEvent('mousemove', targetX, targetY);
	} else {
		// Simulate smooth movement with multiple mousemove events
		const stepDeltaX = deltaX / steps;
		const stepDeltaY = deltaY / steps;

		for (let i = 1; i <= steps; i++) {
			const nextX = Math.round(currentPos.x + stepDeltaX * i);
			const nextY = Math.round(currentPos.y + stepDeltaY * i);

			dispatchMouseEvent('mousemove', nextX, nextY);
			updateCursorPosition(nextX, nextY);

			// Small delay between steps for smooth movement
			await new Promise((resolve) => setTimeout(resolve, 16)); // ~60fps
		}
	}
}

/**
 * Helper function to perform a complete mouse click sequence
 * Works across all browsers (Chrome, Firefox, Safari) using Vitest commands
 *
 * @param options - Mouse options including x, y coordinates and button
 * @example
 * await mouseClick({ x: 100, y: 200 })
 * await mouseClick({ x: 100, y: 200, button: 'right' })
 */
export async function mouseClick(options: MouseOptions): Promise<void> {
	const { x, y, button = 'left', options: extraOptions } = options;

	// Update tracked position
	updateCursorPosition(x, y);

	if (isVitestBrowser()) {
		try {
			// Use the custom command
			await commands.mouseClick(x, y, button, extraOptions?.delay);
			return;
		} catch (error) {
			console.warn('Custom mouseClick command failed, falling back to DOM events:', error);
		}
	}

	// Fallback to DOM event simulation
	// Simulate move, down, up sequence
	dispatchMouseEvent('mousemove', x, y);
	dispatchMouseEvent('mousedown', x, y, button);

	if (extraOptions?.delay) {
		await new Promise((resolve) => setTimeout(resolve, extraOptions.delay));
	}

	dispatchMouseEvent('mouseup', x, y, button);
	dispatchMouseEvent('click', x, y, button);
}

/**
 * Simulate a double click at the specified coordinates
 * Works across all browsers (Chrome, Firefox, Safari) using Vitest commands
 *
 * @param options - Mouse options including x, y coordinates
 * @example
 * await mouseDoubleClick({ x: 100, y: 200 })
 */
export async function mouseDoubleClick(options: Omit<MouseOptions, 'clickCount'>): Promise<void> {
	const { x, y, button = 'left' } = options;

	// Update tracked position
	updateCursorPosition(x, y);

	if (isVitestBrowser()) {
		try {
			// Use the custom command
			await commands.mouseDoubleClick(x, y, button);
			return;
		} catch (error) {
			console.warn('Custom mouseDoubleClick command failed, falling back to DOM events:', error);
		}
	}

	// Fallback to two quick clicks
	await mouseClick({ x, y, button });
	await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay between clicks
	await mouseClick({ x, y, button });
}

/**
 * Simple drag and drop - disable pointer capture to avoid Firefox issues
 * Now supports long press functionality
 */
export async function dragAndDrop(
	element: Element | { element(): Element },
	delta: { deltaX: number; deltaY: number },
	options: {
		steps?: number;
		delay?: number;
		longpress?: number; // Duration in ms to wait before starting drag
	} = {},
): Promise<void> {
	const { steps = 1, delay = 0, longpress = 0 } = options;

	// Get element coords
	const domElement =
		'element' in element && typeof element.element === 'function'
			? element.element()
			: (element as Element);

	const rect = domElement.getBoundingClientRect();
	const startCoords = {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
	const endCoords = {
		x: startCoords.x + delta.deltaX,
		y: startCoords.y + delta.deltaY,
	};

	// Firefox-specific adjustments
	const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
	const actualSteps = steps;
	const stepDelay = 1;
	const holdDelay = delay;

	// Temporarily disable setPointerCapture to avoid the error
	const originalSetPointerCapture = HTMLElement.prototype.setPointerCapture;
	const originalReleasePointerCapture = HTMLElement.prototype.releasePointerCapture;

	if (isFirefox) {
		HTMLElement.prototype.setPointerCapture = function () {
			// Do nothing - just prevent the error
		};
		HTMLElement.prototype.releasePointerCapture = function () {
			// Do nothing
		};
	}

	try {
		// Use a valid pointerId
		const validPointerId = isFirefox ? 0 : 1;

		// Enhanced pointer events with proper properties
		const baseEventProps = {
			bubbles: true,
			cancelable: true,
			pointerId: validPointerId,
			width: 1,
			height: 1,
			pressure: 0.5,
			tangentialPressure: 0,
			tiltX: 0,
			tiltY: 0,
			twist: 0,
			pointerType: 'mouse' as const,
			isPrimary: true,
			view: window,
		};

		// Helper to dispatch pointer events
		const dispatchPointerEvent = (type: string, x: number, y: number, props: any) => {
			const event = new PointerEvent(type, {
				...props,
				clientX: x,
				clientY: y,
				screenX: x,
				screenY: y,
			});
			domElement.dispatchEvent(event);
			return event;
		};

		// Move to start position first
		dispatchPointerEvent('pointermove', startCoords.x, startCoords.y, baseEventProps);
		await new Promise((resolve) => setTimeout(resolve, 1));

		// Start drag sequence
		dispatchPointerEvent('pointerdown', startCoords.x, startCoords.y, {
			...baseEventProps,
			button: 0,
			buttons: 1,
		});

		// Wait for long press duration if specified
		if (longpress > 0) {
			await new Promise((resolve) => setTimeout(resolve, longpress));
		}

		await new Promise((resolve) => setTimeout(resolve, holdDelay));

		// Smooth movement with multiple steps
		for (let i = 1; i <= actualSteps; i++) {
			const progress = i / actualSteps;
			const currentX = startCoords.x + delta.deltaX * progress;
			const currentY = startCoords.y + delta.deltaY * progress;

			dispatchPointerEvent('pointermove', currentX, currentY, baseEventProps);
			await new Promise((resolve) => setTimeout(resolve, stepDelay));
		}

		await new Promise((resolve) => setTimeout(resolve, 1));

		// End drag sequence
		dispatchPointerEvent('pointerup', endCoords.x, endCoords.y, {
			...baseEventProps,
			button: 0,
			buttons: 0,
		});
	} finally {
		// Restore original functions
		HTMLElement.prototype.setPointerCapture = originalSetPointerCapture;
		HTMLElement.prototype.releasePointerCapture = originalReleasePointerCapture;
	}
}

/**
 * Force a real user interaction by focusing and using keyboard
 * Last resort method for testing
 */
export async function dragUsingKeyboard(
	element: Element | { element(): Element },
	delta: { deltaX: number; deltaY: number },
): Promise<void> {
	const domElement =
		'element' in element && typeof element.element === 'function'
			? element.element()
			: (element as Element);

	// Make element focusable if it isn't already
	if (!domElement.hasAttribute('tabindex')) {
		(domElement as HTMLElement).setAttribute('tabindex', '0');
	}

	// Focus the element
	(domElement as HTMLElement).focus();

	// Try using arrow keys (if the drag library supports keyboard navigation)
	const steps = Math.max(Math.abs(delta.deltaX), Math.abs(delta.deltaY));

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
 * Mouse wheel scroll simulation
 * Works across all browsers (Chrome, Firefox, Safari) using Vitest commands
 *
 * @param options - Scroll options
 * @example
 * await mouseWheel({ x: 100, y: 200, deltaX: 0, deltaY: -100 }) // Scroll up
 * await mouseWheel({ x: 100, y: 200, deltaX: 0, deltaY: 100 })  // Scroll down
 */
export async function mouseWheel(options: {
	x: number;
	y: number;
	deltaX: number;
	deltaY: number;
}): Promise<void> {
	const { x, y, deltaX, deltaY } = options;

	// Update tracked position
	updateCursorPosition(x, y);

	if (isVitestBrowser()) {
		try {
			// Use the custom command
			await commands.mouseWheel(deltaX, deltaY);
			return;
		} catch (error) {
			console.warn('Custom mouseWheel command failed, falling back to DOM events:', error);
		}
	}

	// Fallback to DOM wheel event
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
	if (elementAtPoint) {
		elementAtPoint.dispatchEvent(wheelEvent);
	} else {
		document.dispatchEvent(wheelEvent);
	}
}
