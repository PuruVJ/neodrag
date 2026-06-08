/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Neodrag } from '../../src/index.ts';
import { aspectRatio, resizeAxis, resizeEvents, resizeHandles } from '../../src/resize/index.ts';
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

function mockBox(w: number, h: number) {
	return () =>
		({ width: w, height: h, top: 0, left: 0, right: w, bottom: h, toJSON: () => ({}) }) as DOMRect;
}

describe('resize plugins', () => {
	let engine: Neodrag;
	let box: HTMLDivElement;

	beforeEach(() => {
		HTMLElement.prototype.setPointerCapture = function () {};
		HTMLElement.prototype.releasePointerCapture = function () {};
		HTMLElement.prototype.hasPointerCapture = () => false;
		document.body.replaceChildren();
		box = document.createElement('div');
		box.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:50px';
		document.body.appendChild(box);
		engine = new Neodrag({ plugins: [], dev: false });
	});

	afterEach(() => {
		engine.dispose();
		document.body.replaceChildren();
	});

	it('resizeHandles use full-edge strips for cardinal edges', () => {
		engine.resizable(box, [resizeHandles({ edges: 'all', size: 12 })]);
		const n = box.querySelector(`[${RESIZE_HANDLE_ATTR}="n"]`) as HTMLElement;
		const e = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		const se = box.querySelector(`[${RESIZE_HANDLE_ATTR}="se"]`) as HTMLElement;
		expect(n.style.left).toBe('0px');
		expect(n.style.right).toBe('0px');
		expect(n.style.cursor).toBe('ns-resize');
		expect(e.style.top).toBe('0px');
		expect(e.style.bottom).toBe('0px');
		expect(e.style.cursor).toBe('ew-resize');
		expect(se.style.width).toBe('24px');
		expect(se.style.height).toBe('24px');
		expect(se.style.cursor).toBe('nwse-resize');
	});

	it('resizeHandles honor cornerSize for diagonal hit targets', () => {
		engine.resizable(box, [resizeHandles({ edges: ['sw'], size: 8, cornerSize: 20 })]);
		const sw = box.querySelector(`[${RESIZE_HANDLE_ATTR}="sw"]`) as HTMLElement;
		expect(sw.style.width).toBe('20px');
		expect(sw.style.height).toBe('20px');
		expect(sw.style.cursor).toBe('nesw-resize');
	});

	it('resizeAxis locks width on y-only resize', () => {
		engine.resizable(box, [resizeHandles({ edges: ['s'], size: 10 }), resizeAxis('y')]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="s"]`) as HTMLElement;
		let w = 100;
		let h = 50;
		const syncRect = () => {
			box.getBoundingClientRect = mockBox(w, h);
			handle.getBoundingClientRect = () =>
				({
					left: 45,
					top: h - 10,
					width: 10,
					height: 10,
					right: 55,
					bottom: h,
					toJSON: () => ({}),
				}) as DOMRect;
		};
		syncRect();

		pointer(handle, 'pointerdown', 50, h - 5);
		h = 80;
		syncRect();
		pointer(document.documentElement, 'pointermove', 50, h);
		pointer(document.documentElement, 'pointerup', 50, h);

		expect(box.style.width).toBe('100px');
		expect(Number.parseFloat(box.style.height)).toBeGreaterThan(70);
	});

	it('aspectRatio preserve keeps width:height ratio', () => {
		engine.resizable(box, [resizeHandles({ edges: ['e'], size: 10 }), aspectRatio('preserve')]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		let w = 100;
		const h = 50;
		box.getBoundingClientRect = mockBox(w, h);
		handle.getBoundingClientRect = () =>
			({
				left: 90,
				top: 20,
				width: 10,
				height: 10,
				right: 100,
				bottom: 30,
				toJSON: () => ({}),
			}) as DOMRect;

		pointer(handle, 'pointerdown', 95, 25);
		w = 200;
		pointer(document.documentElement, 'pointermove', 200, 25);
		pointer(document.documentElement, 'pointerup', 200, 25);

		const outW = Number.parseFloat(box.style.width);
		const outH = Number.parseFloat(box.style.height);
		expect(outW / outH).toBeCloseTo(2, 5);
		expect(outW).toBeGreaterThan(150);
	});

	it('resizeEvents fires start, resize, and end', () => {
		const onStart = vi.fn();
		const onResize = vi.fn();
		const onEnd = vi.fn();
		engine.resizable(box, [
			resizeHandles({ edges: ['e'], size: 10 }),
			resizeEvents({ onStart, onResize, onEnd }),
		]);
		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		let w = 100;
		const syncRect = () => {
			box.getBoundingClientRect = mockBox(w, 50);
			handle.getBoundingClientRect = () =>
				({
					left: w - 10,
					top: 20,
					width: 10,
					height: 10,
					right: w,
					bottom: 30,
					toJSON: () => ({}),
				}) as DOMRect;
		};
		syncRect();

		pointer(handle, 'pointerdown', 95, 25);
		w = 140;
		syncRect();
		pointer(document.documentElement, 'pointermove', 140, 25);
		expect(onStart).toHaveBeenCalledTimes(1);
		expect(onStart.mock.calls[0]![0].sizePx.width).toBe(100);
		expect(onResize).toHaveBeenCalled();
		expect(box.style.width).not.toBe('100px');

		pointer(document.documentElement, 'pointerup', 140, 25);
		expect(onEnd).toHaveBeenCalledTimes(1);
		expect(onEnd.mock.calls[0]![0].reason).toBe('commit');
	});
});
