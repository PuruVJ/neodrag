/**
 * @vitest-environment jsdom
 *
 * Resize position channel: a `w`/`n` edge moves the top-left to pin the far edge (translate), and
 * the controlled `size`/`position` inputs drive it outside a gesture. Plus the additive translate
 * composition that lets drag and resize share one node without clobbering each other.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Resize, type ResizeOptions, type ResizeEdge } from '../../src/resize/resize.ts';
import {
	applyTranslate,
	clearTranslate,
	TRANSLATE_DRAG,
	TRANSLATE_RESIZE,
} from '../../src/transform.ts';
import { input, mockRect, translate } from './_browser.ts';

/** A 100×80 box anchored at (0,0) with a handle for `edge`. */
function setup(edge: ResizeEdge, options: ResizeOptions = {}) {
	const box = document.createElement('div');
	const handle = document.createElement('div');
	handle.setAttribute('data-neodrag-resize-handle', edge);
	box.appendChild(handle);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 });
	const dnd = new Interactions({ defaultSensors: false });
	const resize = new Resize();
	dnd.use(resize);
	const h = resize.bind(box, options);
	const drive = (phase: 'start' | 'move' | 'end', x: number, y: number) =>
		({
			start: dnd.host.onInteractionStart,
			move: dnd.host.onInteractionMove,
			end: dnd.host.onInteractionEnd,
		})[phase].call(dnd.host, input(handle, phase, x, y));
	return { box, handle: h, drive };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Resize position channel', () => {
	it('w edge grows leftward — width up, top-left shifts left, right edge pinned', () => {
		const { box, handle, drive } = setup('w');
		drive('start', 0, 40);
		drive('move', -30, 40); // pull the left edge 30px left
		expect(box.style.width).toBe('130px');
		expect(translate(box)).toEqual({ x: -30, y: 0 });
		expect(handle.position).toEqual({ x: -30, y: 0 });
		drive('end', -30, 40);
	});

	it('n edge grows upward — height up, top-left shifts up, bottom edge pinned', () => {
		const { box, drive } = setup('n');
		drive('start', 50, 0);
		drive('move', 50, -20);
		expect(box.style.height).toBe('100px');
		expect(translate(box)).toEqual({ x: 0, y: -20 });
		drive('end', 50, -20);
	});

	it('nw corner shifts both axes', () => {
		const { box, drive } = setup('nw');
		drive('start', 0, 0);
		drive('move', -10, -25);
		expect(box.style.width).toBe('110px');
		expect(box.style.height).toBe('105px');
		expect(translate(box)).toEqual({ x: -10, y: -25 });
		drive('end', -10, -25);
	});

	it('e/s edges never move position', () => {
		const { box, handle, drive } = setup('se');
		drive('start', 100, 80);
		drive('move', 140, 130);
		expect(box.style.width).toBe('140px');
		expect(box.style.height).toBe('130px');
		expect(handle.position).toEqual({ x: 0, y: 0 });
		drive('end', 140, 130);
	});

	it('keeps the far edge pinned even when the size is clamped by bounds', () => {
		// Allow growing left only to x = -50; pulling 200px left clamps width to 150 and the shift to -50.
		const { box, drive } = setup('w', { bounds: { left: -50, top: -100, right: 200, bottom: 200 } });
		drive('start', 0, 40);
		drive('move', -200, 40);
		expect(box.style.width).toBe('150px');
		expect(translate(box)).toEqual({ x: -50, y: 0 }); // right edge (100) stays put
		drive('end', -200, 40);
	});

	it('commits left/top in the resize op for collab convergence', () => {
		const ops: unknown[] = [];
		const { drive } = setup('w', { id: 'panel', onCommit: (op) => ops.push(op) });
		drive('start', 0, 40);
		drive('move', -30, 40);
		drive('end', -30, 40);
		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 130, height: 80, left: -30, top: 0 }]);
	});
});

describe('Resize controlled inputs', () => {
	it('applies a controlled size at bind', () => {
		const { box } = setup('se', { size: { width: 150, height: 120 } });
		expect(box.style.width).toBe('150px');
		expect(box.style.height).toBe('120px');
	});

	it('applies a controlled position at bind', () => {
		const { box, handle } = setup('se', { position: { x: 12, y: 8 } });
		expect(translate(box)).toEqual({ x: 12, y: 8 });
		expect(handle.position).toEqual({ x: 12, y: 8 });
	});

	it('update() drives size/position outside a gesture', () => {
		const { box, handle } = setup('se');
		handle.update({ size: { width: 200, height: 160 } });
		handle.update({ position: { x: 7, y: 3 } });
		expect(box.style.width).toBe('200px');
		expect(translate(box)).toEqual({ x: 7, y: 3 });
	});

	it('ignores controlled writes mid-gesture (the gesture owns the node)', () => {
		const { box, handle, drive } = setup('w');
		drive('start', 0, 40);
		drive('move', -30, 40);
		handle.update({ position: { x: 999, y: 999 } }); // must not fight the live resize
		expect(translate(box)).toEqual({ x: -30, y: 0 });
		drive('end', -30, 40);
	});
});

describe('Additive translate composition (drag + resize share a node)', () => {
	it('sums independent contributions instead of clobbering', () => {
		const node = document.createElement('div');
		applyTranslate(node, 30, 0, TRANSLATE_DRAG);
		applyTranslate(node, -20, 0, TRANSLATE_RESIZE);
		expect(translate(node)).toEqual({ x: 10, y: 0 }); // 30 + (-20)

		// Updating one part leaves the other intact — no jump when switching gestures.
		applyTranslate(node, 30, 12, TRANSLATE_DRAG);
		expect(translate(node)).toEqual({ x: 10, y: 12 });

		clearTranslate(node, TRANSLATE_RESIZE);
		expect(translate(node)).toEqual({ x: 30, y: 12 }); // only the resize part removed
	});
});
