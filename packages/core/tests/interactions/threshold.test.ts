/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Draggable, Neodrag } from '../../src/index.ts';

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

function pointer(
	target: EventTarget,
	type: string,
	x: number,
	y: number,
	extra: PointerEventInit = {},
) {
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
			...extra,
		}),
	);
}

describe('drag threshold option', () => {
	let restoreCapture: (() => void) | undefined;

	beforeEach(() => {
		restoreCapture = patchPointerCapture();
	});

	afterEach(() => {
		restoreCapture?.();
		document.body.replaceChildren();
	});

	it('default threshold requires movement before translate changes', () => {
		const binding = new Draggable({ plugins: [] });
		const node = document.createElement('div');
		node.style.cssText = 'position:absolute;left:0;top:0;width:80px;height:80px';
		document.body.appendChild(node);
		binding.attach(node);

		pointer(node, 'pointerdown', 40, 40);
		pointer(node, 'pointermove', 41, 41);
		const subThreshold = node.style.translate;
		const subX = Number.parseFloat(subThreshold.split(/\s+/)[0] ?? '0');
		const subY = Number.parseFloat(subThreshold.split(/\s+/)[1] ?? '0');
		expect(Math.hypot(subX, subY)).toBeLessThan(2);

		pointer(node, 'pointermove', 50, 50);
		const after = node.style.translate;
		const afterX = Number.parseFloat(after.split(/\s+/)[0] ?? '0');
		const afterY = Number.parseFloat(after.split(/\s+/)[1] ?? '0');
		expect(Math.hypot(afterX, afterY)).toBeGreaterThanOrEqual(8);
		binding.destroy();
	});

	it('threshold null starts drag on first move', () => {
		const binding = new Draggable({ plugins: [], threshold: null });
		const node = document.createElement('div');
		node.style.cssText = 'position:absolute;left:0;top:0;width:80px;height:80px';
		document.body.appendChild(node);
		binding.attach(node);

		pointer(node, 'pointerdown', 40, 40);
		pointer(node, 'pointermove', 41, 41);
		expect(node.style.translate).toContain('px');
		binding.destroy();
	});

	it('custom distance delays drag until exceeded', () => {
		const binding = new Draggable({ plugins: [], threshold: { distance: 20 } });
		const node = document.createElement('div');
		node.style.cssText = 'position:absolute;left:0;top:0;width:80px;height:80px';
		document.body.appendChild(node);
		binding.attach(node);

		pointer(node, 'pointerdown', 40, 40);
		pointer(node, 'pointermove', 50, 50);
		const subThreshold = node.style.translate;
		const subX = Number.parseFloat(subThreshold.split(/\s+/)[0] ?? '0');
		const subY = Number.parseFloat(subThreshold.split(/\s+/)[1] ?? '0');
		expect(Math.hypot(subX, subY)).toBeLessThan(15);

		pointer(node, 'pointermove', 65, 65);
		const after = node.style.translate;
		const afterX = Number.parseFloat(after.split(/\s+/)[0] ?? '0');
		const afterY = Number.parseFloat(after.split(/\s+/)[1] ?? '0');
		expect(Math.hypot(afterX, afterY)).toBeGreaterThanOrEqual(20);
		binding.destroy();
	});

	it('engine.draggable accepts threshold option', () => {
		const engine = new Neodrag({ dev: false });
		const node = document.createElement('div');
		node.style.cssText = 'position:absolute;left:0;top:0;width:80px;height:80px';
		document.body.appendChild(node);
		engine.draggable(node, [], { threshold: null });

		pointer(node, 'pointerdown', 10, 10);
		pointer(node, 'pointermove', 11, 11);
		expect(node.style.translate).toContain('px');
		engine.dispose();
	});
});
