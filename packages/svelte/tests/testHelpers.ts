import { fireEvent } from '@testing-library/svelte';

/**
 * Simulate dragging a draggable element using the mouse.
 *
 * @param element the element to drag
 * @param clientX the X coordinate to drag the element to
 * @param clientY the Y coordinate to drag the element to
 */
export async function drag(element: HTMLElement, startX = 0, startY = 0, endX = 0, endY = 0) {
	await fireEvent.mouseEnter(element);
	await fireEvent.mouseOver(element);
	await fireEvent.mouseDown(element, { clientX: startX, clientY: startY });
	await fireEvent.mouseMove(element, { clientX: endX, clientY: endY });
	await fireEvent.mouseUp(element);
}

function createTouchList(clientX: number, clientY: number) {
	let touches: any = {
		item: (index: number) => {
			return <any>{
				clientX,
				clientY,
			};
		},
		length: 1,
		0: <any>{ clientX, clientY },
	};

	touches[Symbol.iterator] = function* () {
		yield <any>{ clientX, clientY };
	};

	return touches;
}

/**
 * Simulate dragging a draggable element using touch.
 *
 * @param element the element to drag
 * @param startX the X coordinate to start the drag event at
 * @param startY the Y coordinate to start the drag event at
 * @param endX the X coordinate to drag the element to
 * @param endY the Y coordinate to drag the element to
 */
export async function touchDrag(element: HTMLElement, startX = 0, startY = 0, endX = 0, endY = 0) {
	await fireEvent.touchStart(element, { touches: createTouchList(startX, startY) });
	await fireEvent.touchMove(element, { touches: createTouchList(endX, endY) });
	await fireEvent.touchEnd(element, { touches: createTouchList(endX, endY) });
}
