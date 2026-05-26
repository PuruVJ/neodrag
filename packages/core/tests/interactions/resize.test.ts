/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { resizeHandles, sizeBounds } from '../../src/resize/index.ts';
import { RESIZE_HANDLE_ATTR } from '../../src/resize/types.ts';

function pointer(target: EventTarget, type: string, x: number, y: number) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			pointerId: 1,
			pointerType: 'mouse',
			isPrimary: true,
			clientX: x,
			clientY: y,
			buttons: type === 'pointerup' ? 0 : 1,
		}),
	);
}

describe('resizable', () => {
	let engine: Neodrag;
	let box: HTMLDivElement;

	beforeEach(() => {
		HTMLElement.prototype.setPointerCapture = function () {};
		HTMLElement.prototype.releasePointerCapture = function () {};
		HTMLElement.prototype.hasPointerCapture = () => false;

		document.body.replaceChildren();
		box = document.createElement('div');
		box.style.cssText = 'position:absolute;left:0;top:0;width:200px;height:100px';
		document.body.appendChild(box);
		engine = new Neodrag({ plugins: [], dev: false });
	});

	afterEach(() => {
		engine.dispose();
		document.body.replaceChildren();
	});

	it('creates resize handles and grows on east drag', () => {
		engine.resizable(box, [resizeHandles({ edges: ['e'], size: 10 })]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		expect(handle).toBeTruthy();

		const rect = { width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100 };
		box.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect }) as DOMRect;
		handle.getBoundingClientRect = () =>
			({ left: 190, top: 45, width: 10, height: 10, right: 200, bottom: 55, toJSON: () => ({}) }) as DOMRect;

		pointer(handle, 'pointerdown', 195, 50);
		pointer(document.documentElement, 'pointermove', 250, 50);
		pointer(document.documentElement, 'pointerup', 250, 50);

		expect(box.style.width).toBe('255px');
	});

	it('restores initial size on cancel', () => {
		engine.resizable(box, [resizeHandles({ edges: ['e'], size: 10 })]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		const rect = { width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100 };
		box.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect }) as DOMRect;
		handle.getBoundingClientRect = () =>
			({ left: 190, top: 45, width: 10, height: 10, right: 200, bottom: 55, toJSON: () => ({}) }) as DOMRect;

		pointer(handle, 'pointerdown', 195, 50);
		pointer(document.documentElement, 'pointermove', 280, 50);

		document.documentElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);

		expect(box.style.width).toBe('200px');
	});

	it('west edge resize shifts left and grows width', () => {
		box.style.cssText = 'position:absolute;left:100px;top:40px;width:200px;height:100px';
		engine.resizable(box, [resizeHandles({ edges: ['w'], size: 10 })]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="w"]`) as HTMLElement;
		expect(handle).toBeTruthy();

		const rect = { width: 200, height: 100, top: 40, left: 100, right: 300, bottom: 140 };
		box.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect }) as DOMRect;
		handle.getBoundingClientRect = () =>
			({ left: 100, top: 85, width: 10, height: 10, right: 110, bottom: 95, toJSON: () => ({}) }) as DOMRect;

		pointer(handle, 'pointerdown', 105, 90);
		pointer(document.documentElement, 'pointermove', 55, 90);
		pointer(document.documentElement, 'pointerup', 55, 90);

		expect(box.style.width).toBe('250px');
		expect(box.style.left).toBe('50px');
	});

	it('clamps width with sizeBounds', () => {
		engine.resizable(box, [
			resizeHandles({ edges: ['e'], size: 10 }),
			sizeBounds({ maxWidth: 220 }),
		]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		const rect = { width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100 };
		box.getBoundingClientRect = () => ({ ...rect, toJSON: () => rect }) as DOMRect;
		handle.getBoundingClientRect = () =>
			({ left: 190, top: 45, width: 10, height: 10, right: 200, bottom: 55, toJSON: () => ({}) }) as DOMRect;

		pointer(handle, 'pointerdown', 195, 50);
		pointer(document.documentElement, 'pointermove', 400, 50);
		pointer(document.documentElement, 'pointerup', 400, 50);

		expect(box.style.width).toBe('220px');
	});
});
