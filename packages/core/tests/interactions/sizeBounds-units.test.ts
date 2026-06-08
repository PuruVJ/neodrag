/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Length, Neodrag } from '../../src/index.ts';
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

describe('sizeBounds Length', () => {
	let engine: Neodrag;
	let box: HTMLDivElement;

	beforeEach(() => {
		HTMLElement.prototype.setPointerCapture = function () {};
		HTMLElement.prototype.releasePointerCapture = function () {};
		HTMLElement.prototype.hasPointerCapture = () => false;
		document.documentElement.style.fontSize = '16px';
		document.body.replaceChildren();
		box = document.createElement('div');
		box.style.cssText = 'position:absolute;left:0;top:0;width:200px;height:8rem';
		document.body.appendChild(box);
		engine = new Neodrag({ plugins: [], dev: false });
	});

	afterEach(() => {
		engine.dispose();
		document.body.replaceChildren();
	});

	it('clamps to minWidth in rem', () => {
		engine.resizable(
			box,
			[resizeHandles({ edges: ['e'], size: 10 }), sizeBounds({ minWidth: '10rem' })],
			{ length: new Length() },
		);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		let w = 200;
		box.getBoundingClientRect = () =>
			({
				width: w,
				height: 128,
				top: 0,
				left: 0,
				right: w,
				bottom: 128,
				toJSON: () => ({}),
			}) as DOMRect;
		handle.getBoundingClientRect = () =>
			({
				left: w - 10,
				top: 59,
				width: 10,
				height: 10,
				right: w,
				bottom: 69,
				toJSON: () => ({}),
			}) as DOMRect;

		pointer(handle, 'pointerdown', w - 5, 64);
		w = 80;
		pointer(document.documentElement, 'pointermove', 75, 64);
		pointer(document.documentElement, 'pointerup', 75, 64);

		expect(box.style.width).toBe('160px');
	});
});
