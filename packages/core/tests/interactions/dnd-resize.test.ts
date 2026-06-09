/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { programmaticToInput } from '../../src/interaction-input.ts';
import { Resize, type ResizeOptions } from '../../src/resize/resize.ts';

function mockRect(el: HTMLElement, rect: { left: number; top: number; right: number; bottom: number }) {
	el.getBoundingClientRect = () =>
		({
			...rect,
			width: rect.right - rect.left,
			height: rect.bottom - rect.top,
			x: rect.left,
			y: rect.top,
			toJSON() {},
		}) as DOMRect;
}

function input(target: HTMLElement, phase: 'start' | 'move' | 'end', x: number, y: number) {
	return programmaticToInput({ phase, clientX: x, clientY: y, pointerId: 1, target });
}

afterEach(() => {
	document.body.innerHTML = '';
});

function setup(options: ResizeOptions = {}) {
	const box = document.createElement('div');
	const handle = document.createElement('div');
	handle.setAttribute('data-neodrag-resize-handle', 'se');
	box.appendChild(handle);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 }); // 100×80
	const dnd = new Interactions({ defaultSensors: false });
	const resize = new Resize();
	dnd.use(resize);
	resize.bind(box, options);
	return { box, handle, dnd };
}

describe('Resize capability (DOM)', () => {
	it('resizes from the SE handle by the pointer delta', () => {
		const { box, handle, dnd } = setup();
		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 130, 110));
		expect(box.style.width).toBe('130px');
		expect(box.style.height).toBe('110px');
		dnd.host.onInteractionEnd(input(handle, 'end', 130, 110));
	});

	it('clamps to maxWidth', () => {
		const { box, handle, dnd } = setup({ minWidth: 50, maxWidth: 120 });
		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 999, 80));
		expect(box.style.width).toBe('120px');
		dnd.host.onInteractionEnd(input(handle, 'end', 999, 80));
	});

	it('locks aspect ratio', () => {
		const { box, handle, dnd } = setup({ aspectRatio: true }); // 100×80 → ratio 1.25
		dnd.host.onInteractionStart(input(handle, 'start', 100, 80));
		dnd.host.onInteractionMove(input(handle, 'move', 150, 80));
		expect(box.style.width).toBe('150px');
		expect(box.style.height).toBe('120px');
		dnd.host.onInteractionEnd(input(handle, 'end', 150, 80));
	});

	it('does not start when the pointerdown misses a handle', () => {
		const { box, dnd } = setup();
		dnd.host.onInteractionStart(input(box, 'start', 50, 40)); // on body, not handle
		dnd.host.onInteractionMove(input(box, 'move', 80, 70));
		expect(box.style.width).toBe('');
		expect(dnd.session).toBeNull();
	});
});
