/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Resizable } from '../../src/resizable-binding.ts';
import {
	composeResizePluginList,
	resolveResizeSizeBounds,
} from '../../src/resize-bounds.ts';
import { resizeHandles, sizeBounds } from '../../src/resize/index.ts';
import { SIZE_BOUNDS_PLUGIN_KEY } from '../../src/resize/plugins.ts';
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

describe('resize size bounds', () => {
	let box: HTMLDivElement;

	beforeEach(() => {
		HTMLElement.prototype.setPointerCapture = function () {};
		HTMLElement.prototype.releasePointerCapture = function () {};
		HTMLElement.prototype.hasPointerCapture = () => false;
		document.body.replaceChildren();
		box = document.createElement('div');
		box.style.cssText = 'position:absolute;left:0;top:0;width:100px;height:50px';
		document.body.appendChild(box);
	});

	afterEach(() => {
		document.body.replaceChildren();
	});

	it('resolveResizeSizeBounds expands scalar to width and height', () => {
		expect(resolveResizeSizeBounds({ minSize: 40 })).toEqual({
			minWidth: 40,
			minHeight: 40,
		});
		expect(resolveResizeSizeBounds({ maxSize: { width: 200, height: 120 } })).toEqual({
			maxWidth: 200,
			maxHeight: 120,
		});
	});

	it('composeResizePluginList replaces sizeBounds plugin from slots', () => {
		const legacy = sizeBounds({ minWidth: 10 });
		const list = composeResizePluginList(
			[resizeHandles({ edges: ['e'] }), legacy],
			{ minSize: { width: 80, height: 60 } },
		);
		const resolved = list.filter((slot) => typeof slot !== 'function') as import('../../src/resize/types.ts').ResizePlugin[];
		const bounds = resolved.filter((p) => p.key === SIZE_BOUNDS_PLUGIN_KEY);
		expect(bounds).toHaveLength(1);
		expect(bounds[0]).not.toBe(legacy);
	});

	it('Resizable enforces maxSize on width and height', () => {
		const resize = new Resizable({
			plugins: [resizeHandles({ edges: ['se'], size: 10, cornerSize: 16 })],
			maxSize: { width: 120, height: 70 },
		});
		resize.attach(box);

		const handle = box.querySelector(`[${RESIZE_HANDLE_ATTR}="se"]`) as HTMLElement;
		let w = 100;
		let h = 50;
		const syncRect = () => {
			box.getBoundingClientRect = mockBox(w, h);
			handle.getBoundingClientRect = () =>
				({
					left: w - 10,
					top: h - 10,
					width: 16,
					height: 16,
					right: w,
					bottom: h,
					toJSON: () => ({}),
				}) as DOMRect;
		};
		syncRect();

		pointer(handle, 'pointerdown', w - 5, h - 5);
		w = 200;
		h = 120;
		syncRect();
		pointer(document.documentElement, 'pointermove', 200, 120);
		expect(box.style.width).toBe('120px');
		expect(box.style.height).toBe('70px');
		pointer(document.documentElement, 'pointerup', 200, 120);

		resize.destroy();
	});

	it('Resizable enforces minSize on width and height', () => {
		const resize = new Resizable({
			plugins: [
				resizeHandles({ edges: ['e', 's'], size: 10 }),
			],
			minSize: { width: 80, height: 40 },
		});
		resize.attach(box);

		const east = box.querySelector(`[${RESIZE_HANDLE_ATTR}="e"]`) as HTMLElement;
		const south = box.querySelector(`[${RESIZE_HANDLE_ATTR}="s"]`) as HTMLElement;
		let w = 100;
		let h = 50;
		const syncEast = () => {
			box.getBoundingClientRect = mockBox(w, h);
			east.getBoundingClientRect = () =>
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
		const syncSouth = () => {
			box.getBoundingClientRect = mockBox(w, h);
			south.getBoundingClientRect = () =>
				({
					left: 40,
					top: h - 10,
					width: 20,
					height: 10,
					right: 60,
					bottom: h,
					toJSON: () => ({}),
				}) as DOMRect;
		};
		syncEast();

		pointer(east, 'pointerdown', 95, 25);
		pointer(document.documentElement, 'pointermove', 20, 25);
		w = 80;
		syncEast();
		expect(box.style.width).toBe('80px');
		pointer(document.documentElement, 'pointerup', 20, 25);

		syncSouth();
		pointer(south, 'pointerdown', 50, 45);
		pointer(document.documentElement, 'pointermove', 50, 5);
		h = 40;
		syncSouth();
		expect(box.style.height).toBe('40px');
		pointer(document.documentElement, 'pointerup', 50, 5);

		resize.destroy();
	});
});
