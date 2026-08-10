import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Rotate, type RotateOptions } from '../../src/rotate/rotate.ts';
import { input, mockRect } from './_browser.ts';

/** A 100×80 box (center 50,40) with a rotate grip child; pointer coords drive the angle math. */
function setup(options: RotateOptions = {}) {
	const box = document.createElement('div');
	box.style.position = 'absolute';
	const grip = document.createElement('div');
	grip.setAttribute('data-neodrag-rotate-handle', 'top');
	box.appendChild(grip);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 });
	const dnd = new Interactions({ defaultSensors: false });
	const rotate = new Rotate();
	dnd.use(rotate);
	const h = rotate.bind(box, { id: 'knob', ...options });
	const drive = (phase: 'start' | 'move' | 'end', x: number, y: number) =>
		({ start: dnd.host.onInteractionStart, move: dnd.host.onInteractionMove, end: dnd.host.onInteractionEnd }[
			phase
		].call(dnd.host, input(grip, phase, x, y)));
	return { box, handle: h, drive };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Rotate capability', () => {
	it('rotates by the pointer arc around the center', () => {
		const { box, drive } = setup();
		// Pointer starts straight above center (50,0) → angle -90°; ends to the right (90,40) → 0°.
		drive('start', 50, 0);
		drive('move', 90, 40); // delta +90°
		expect(box.style.rotate).toBe('90deg');
		drive('end', 90, 40);
	});

	it('snaps to step degrees', () => {
		const { box, drive } = setup({ step: 45 });
		drive('start', 50, 0);
		drive('move', 90, 30); // ~83° from -90 baseline → snaps to 90
		drive('end', 90, 30);
		// 45° grid: the committed angle is a multiple of 45.
		expect(parseFloat(box.style.rotate) % 45).toBe(0);
	});

	it('clamps to min/max', () => {
		const { box, drive } = setup({ max: 30 });
		drive('start', 50, 0);
		drive('move', 90, 40); // wants +90 → clamped to 30
		expect(box.style.rotate).toBe('30deg');
		drive('end', 90, 40);
	});

	it('honors a corner origin (pivot at top-left)', () => {
		const { box, drive } = setup({ origin: 'tl' }); // pivot (0,0)
		// From (40,0) (angle 0 around tl) to (0,40) (angle 90°) → +90°.
		drive('start', 40, 0);
		drive('move', 0, 40);
		expect(box.style.rotate).toBe('90deg');
		drive('end', 0, 40);
	});

	it('uses the individual rotate property (composes with translate)', () => {
		const { box, drive } = setup();
		box.style.translate = '20px 10px'; // a drag offset already on the node
		drive('start', 50, 0);
		drive('move', 90, 40);
		drive('end', 90, 40);
		expect(box.style.rotate).toBe('90deg');
		expect(box.style.translate).toBe('20px 10px'); // untouched — they don't collide
	});
});

describe('Rotate controlled angle', () => {
	it('applies a controlled angle at bind', () => {
		const { box } = setup({ angle: 30 });
		expect(box.style.rotate).toBe('30deg');
	});

	it('update() drives the angle outside a gesture', () => {
		const { box, handle } = setup();
		handle.update({ angle: 45 });
		expect(box.style.rotate).toBe('45deg');
		expect(handle.angle).toBe(45);
	});

	it('snaps/clamps a controlled angle through step + min/max', () => {
		const { box, handle } = setup({ step: 15, max: 60 });
		handle.update({ angle: 100 }); // snaps to 15-grid then clamps to 60
		expect(box.style.rotate).toBe('60deg');
		expect(handle.angle).toBe(60);
	});

	it('ignores controlled writes mid-gesture (the gesture owns the node)', () => {
		const { box, handle, drive } = setup();
		drive('start', 50, 0);
		drive('move', 90, 40); // → 90°
		handle.update({ angle: 0 }); // must not fight the live rotation
		expect(box.style.rotate).toBe('90deg');
		drive('end', 90, 40);
	});
});
