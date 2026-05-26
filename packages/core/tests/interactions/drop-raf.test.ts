/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineDropPlugin, Neodrag } from '../../src/index.ts';

function patchPointerCapture() {
	const proto = HTMLElement.prototype;
	const prev = {
		set: proto.setPointerCapture,
		release: proto.releasePointerCapture,
		has: proto.hasPointerCapture,
	};
	proto.setPointerCapture = function () {};
	proto.releasePointerCapture = function () {};
	proto.hasPointerCapture = () => false;
	return () => {
		proto.setPointerCapture = prev.set;
		proto.releasePointerCapture = prev.release;
		proto.hasPointerCapture = prev.has;
	};
}

describe('drop target rAF coalescing', () => {
	let rafQueue: FrameRequestCallback[] = [];
	let restoreCapture: (() => void) | undefined;

	beforeEach(() => {
		rafQueue = [];
		let rafId = 0;
		vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
			rafQueue.push(cb);
			return ++rafId;
		});
		vi.stubGlobal('cancelAnimationFrame', () => {});
		restoreCapture = patchPointerCapture();
	});

	afterEach(() => {
		restoreCapture?.();
		vi.unstubAllGlobals();
	});

	it('coalesces multiple pointer moves into one scheduled frame', () => {
		let overCalls = 0;
		const dropPlugin = defineDropPlugin(() => ({
			key: Symbol('spy-over'),
			over() {
				overCalls++;
			},
		}))();

		const engine = new Neodrag({ dev: false });
		const zone = document.createElement('div');
		zone.style.cssText = 'position:absolute;left:0;top:0;width:400px;height:400px';
		const box = document.createElement('div');
		box.style.cssText = 'position:absolute;left:50px;top:50px;width:40px;height:40px';
		zone.appendChild(box);
		document.body.appendChild(zone);

		engine.droppable(zone, [dropPlugin]);
		engine.draggable(box, [], { threshold: null });

		document.elementFromPoint = () => box;

		const dispatch = (type: string, x: number, y: number) => {
			const ev = new PointerEvent(type, {
				bubbles: true,
				cancelable: true,
				clientX: x,
				clientY: y,
				pointerId: 1,
				button: 0,
				isPrimary: true,
			});
			box.dispatchEvent(ev);
			document.documentElement.dispatchEvent(ev);
		};

		dispatch('pointerdown', 70, 70);
		for (let y = 80; y <= 200; y += 10) {
			dispatch('pointermove', 150, y);
		}

		expect(overCalls).toBe(0);
		expect(rafQueue.length).toBeGreaterThan(0);

		for (const cb of rafQueue) cb(performance.now());
		expect(overCalls).toBeGreaterThanOrEqual(1);

		dispatch('pointerup', 150, 200);

		engine.dispose();
		zone.remove();
	});
});
