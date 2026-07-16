/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MINIMAL_DRAG_PLUGINS, Neodrag } from '../../src/index.ts';

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

function createBox() {
	const box = document.createElement('div');
	box.style.cssText = 'position:absolute;left:50px;top:50px;width:80px;height:60px;touch-action:none';
	document.body.appendChild(box);
	return box;
}

describe('engine session lifecycle', () => {
	let restoreCapture: (() => void) | undefined;

	beforeEach(() => {
		restoreCapture = patchPointerCapture();
	});

	afterEach(() => {
		restoreCapture?.();
		document.body.replaceChildren();
	});

	function engine() {
		return new Neodrag({ plugins: MINIMAL_DRAG_PLUGINS, dev: false });
	}

	it('ignores pointerup from a different pointer id', () => {
		const neodrag = engine();
		const box = createBox();
		neodrag.draggable(box, []);

		pointer(box, 'pointerdown', 60, 60, { pointerId: 1 });
		for (let i = 1; i <= 8; i++) {
			pointer(box, 'pointermove', 60 + i * 5, 60 + i * 5, { pointerId: 1 });
		}
		pointer(document.documentElement, 'pointerup', 100, 100, { pointerId: 2 });

		expect(getComputedStyle(box).translate).toContain('40');

		pointer(box, 'pointerup', 100, 100, { pointerId: 1 });
		neodrag.dispose();
	});

	it('rejects a second pointerdown while a session is active', () => {
		const neodrag = engine();
		const a = createBox();
		const b = createBox();
		b.style.left = '200px';
		neodrag.draggable(a, []);
		neodrag.draggable(b, []);

		pointer(a, 'pointerdown', 80, 80, { pointerId: 1 });
		pointer(b, 'pointerdown', 280, 80, { pointerId: 2 });
		pointer(a, 'pointermove', 100, 100, { pointerId: 1 });
		pointer(a, 'pointerup', 100, 100, { pointerId: 1 });

		neodrag.dispose();
	});

	it('runs end hooks when pointer capture fails', () => {
		restoreCapture?.();
		const neodrag = engine();
		const box = createBox();
		neodrag.draggable(box, []);

		const proto = HTMLElement.prototype;
		const prev = proto.setPointerCapture;
		proto.setPointerCapture = function () {
			throw new DOMException('capture failed');
		};

		try {
			pointer(box, 'pointerdown', 60, 60);
			pointer(box, 'pointermove', 120, 120);
			expect(document.body.style.userSelect).not.toBe('none');
		} finally {
			proto.setPointerCapture = prev;
			restoreCapture = patchPointerCapture();
		}

		neodrag.dispose();
	});

	it('dispose ends an active session before destroying plugins', () => {
		const neodrag = engine();
		const box = createBox();
		neodrag.draggable(box, []);

		pointer(box, 'pointerdown', 60, 60);
		pointer(box, 'pointermove', 90, 90);
		expect(() => neodrag.dispose()).not.toThrow();
	});

	it('destroying the active drag source ends the session', () => {
		const neodrag = engine();
		const box = createBox();
		const handle = 		neodrag.draggable(box, []);

		pointer(box, 'pointerdown', 60, 60);
		pointer(box, 'pointermove', 90, 90);
		handle.destroy();
		pointer(box, 'pointermove', 120, 120);
		pointer(box, 'pointerup', 120, 120);

		neodrag.dispose();
	});

	it('reuses a cached child target after its drag source is destroyed', () => {
		const neodrag = engine();
		const rootA = createBox();
		const rootB = createBox();
		rootB.style.left = '200px';
		const child = document.createElement('button');
		rootA.appendChild(child);

		const first = neodrag.draggable(rootA, []);
		pointer(child, 'pointerdown', 60, 60);
		pointer(child, 'pointerup', 60, 60);
		first.destroy();
		rootA.remove();

		rootB.appendChild(child);
		neodrag.draggable(rootB, []);
		pointer(child, 'pointerdown', 210, 60);
		pointer(child, 'pointermove', 225, 75);
		pointer(child, 'pointermove', 240, 90);
		pointer(child, 'pointerup', 240, 90);

		const result = getComputedStyle(rootB).translate;
		neodrag.dispose();
		expect(result).toContain('30');
	});

	it('dispose removes global listeners so a new engine can be used', () => {
		const box = createBox();
		const first = engine();
		first.draggable(box, []);
		first.dispose();

		const second = engine();
		second.draggable(box, []);
		pointer(box, 'pointerdown', 40, 40);
		for (let i = 1; i <= 8; i++) {
			pointer(box, 'pointermove', 40 + i * 5, 40 + i * 5);
		}
		pointer(box, 'pointerup', 80, 80);
		expect(getComputedStyle(box).translate).toContain('40');
		second.dispose();
	});
});
