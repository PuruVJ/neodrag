/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Length, Neodrag } from '../../src/index.ts';
import { resizeHandles } from '../../src/resize/index.ts';
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

describe('resize units', () => {
	let engine: Neodrag;
	let parent: HTMLDivElement;
	let box: HTMLDivElement;
	const preserve = new Length({ units: 'preserve' });

	beforeEach(() => {
		HTMLElement.prototype.setPointerCapture = function () {};
		HTMLElement.prototype.releasePointerCapture = function () {};
		HTMLElement.prototype.hasPointerCapture = () => false;

		document.body.replaceChildren();
		parent = document.createElement('div');
		parent.style.cssText = 'position:relative;width:400px;height:300px';
		box = document.createElement('div');
		box.style.cssText = 'position:absolute;left:0;top:0;width:50%;height:100px';
		parent.appendChild(box);
		document.body.appendChild(parent);
		engine = new Neodrag({ plugins: [], dev: false });
	});

	afterEach(() => {
		engine.dispose();
		document.body.replaceChildren();
	});

	it('preserves percentage width after east resize', () => {
		engine.resizable(box, [resizeHandles({ edges: ['e'], size: 10 })], { length: preserve });
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;

		let w = 200;
		const rect = () => ({
			width: w,
			height: 100,
			top: 0,
			left: 0,
			right: w,
			bottom: 100,
			toJSON: () => ({}),
		});
		box.getBoundingClientRect = () => rect() as DOMRect;
		parent.getBoundingClientRect = () =>
			({
				width: 400,
				height: 300,
				top: 0,
				left: 0,
				right: 400,
				bottom: 300,
				toJSON: () => ({}),
			}) as DOMRect;
		Object.defineProperty(box, 'offsetParent', { value: parent, configurable: true });
		handle.getBoundingClientRect = () =>
			({
				left: w - 10,
				top: 45,
				width: 10,
				height: 10,
				right: w,
				bottom: 55,
				toJSON: () => ({}),
			}) as DOMRect;

		pointer(handle, 'pointerdown', w - 5, 50);
		w = 280;
		pointer(document.documentElement, 'pointermove', w + 5, 50);
		pointer(document.documentElement, 'pointerup', w + 5, 50);

		expect(box.style.width).toMatch(/%$/);
		expect(box.style.width).not.toMatch(/px$/);
	});

	it('restores authored percentage on cancel', () => {
		engine.resizable(box, [resizeHandles({ edges: ['e'], size: 10 })], { length: preserve });
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		const initialWidth = box.style.width;

		let w = 200;
		box.getBoundingClientRect = () =>
			({
				width: w,
				height: 100,
				top: 0,
				left: 0,
				right: w,
				bottom: 100,
				toJSON: () => ({}),
			}) as DOMRect;
		handle.getBoundingClientRect = () =>
			({
				left: w - 10,
				top: 45,
				width: 10,
				height: 10,
				right: w,
				bottom: 55,
				toJSON: () => ({}),
			}) as DOMRect;

		pointer(handle, 'pointerdown', w - 5, 50);
		w = 300;
		pointer(document.documentElement, 'pointermove', w, 50);
		document.documentElement.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
		);

		expect(box.style.width).toBe(initialWidth);
	});

	it('forces px when Length units is px', () => {
		engine.resizable(box, [resizeHandles({ edges: ['e'], size: 10 })], {
			length: new Length({ units: 'px' }),
		});
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		let w = 200;
		box.getBoundingClientRect = () =>
			({
				width: w,
				height: 100,
				top: 0,
				left: 0,
				right: w,
				bottom: 100,
				toJSON: () => ({}),
			}) as DOMRect;
		handle.getBoundingClientRect = () =>
			({
				left: w - 10,
				top: 45,
				width: 10,
				height: 10,
				right: w,
				bottom: 55,
				toJSON: () => ({}),
			}) as DOMRect;

		pointer(handle, 'pointerdown', w - 5, 50);
		w = 250;
		pointer(document.documentElement, 'pointermove', 255, 50);
		pointer(document.documentElement, 'pointerup', 255, 50);

		expect(box.style.width).toMatch(/px$/);
	});
});
