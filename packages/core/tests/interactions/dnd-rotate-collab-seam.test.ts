import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Rotate, type RotateOptions } from '../../src/rotate/rotate.ts';
import type { CollabOp, LocalPresence, RotateOp } from '../../src/collab-types.ts';
import { input, mockRect } from './_browser.ts';

function setup(options: RotateOptions = {}) {
	const box = document.createElement('div');
	box.style.position = 'absolute';
	const grip = document.createElement('div');
	grip.setAttribute('data-neodrag-rotate-handle', 'top');
	box.appendChild(grip);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 }); // center 50,40
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

describe('Rotate collab seam', () => {
	it('commits the final angle once on release', () => {
		const ops: RotateOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) });
		drive('start', 50, 0);
		drive('move', 90, 40); // +90°
		drive('end', 90, 40);
		expect(ops).toEqual([{ type: 'rotate', target: 'knob', angle: 90 }]);
	});

	it('skips the commit when the angle never changed', () => {
		const ops: RotateOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) });
		drive('start', 50, 0);
		drive('move', 50, 0); // no movement
		drive('end', 50, 0);
		expect(ops).toEqual([]);
	});

	it('streams in-flight presence and a null terminator', () => {
		const frames: (LocalPresence | null)[] = [];
		const { handle, drive } = setup();
		handle.onPresence((p) => frames.push(p));
		drive('start', 50, 0);
		drive('move', 90, 40); // 90°
		drive('move', 50, 80); // 180°
		drive('end', 50, 80);
		expect(frames).toEqual([
			{ type: 'rotate', target: 'knob', angle: 90 },
			{ type: 'rotate', target: 'knob', angle: 180 },
			null,
		]);
	});

	it('applyExternal turns the node; subscriptions compose & unsubscribe', () => {
		const a: RotateOp[] = [];
		const b: CollabOp[] = [];
		const { box, handle, drive } = setup({ onCommit: (op) => a.push(op) });
		const off = handle.onCommit((op) => b.push(op));

		handle.applyExternal({ type: 'rotate', target: 'knob', angle: 45 });
		expect(box.style.rotate).toBe('45deg');
		expect(handle.angle).toBe(45);

		drive('start', 50, 0);
		drive('move', 90, 40);
		drive('end', 90, 40);
		expect(a).toHaveLength(1);
		expect(b).toHaveLength(1);

		off();
		drive('start', 50, 0);
		drive('move', 50, 80);
		drive('end', 50, 80);
		expect(a).toHaveLength(2);
		expect(b).toHaveLength(1);
	});

	it('a remote apply is suppressed while a local rotate owns the node', () => {
		const { box, handle, drive } = setup();
		drive('start', 50, 0);
		drive('move', 90, 40); // local angle 90
		handle.applyExternal({ type: 'rotate', target: 'knob', angle: 999 }); // ignored
		expect(box.style.rotate).toBe('90deg');
		drive('end', 90, 40);
	});

	it('applies a remote op suppressed mid-rotate when the local gesture commits nothing', () => {
		const { box, handle, drive } = setup();
		drive('start', 50, 0);
		drive('move', 50, 0); // no change
		handle.applyExternal({ type: 'rotate', target: 'knob', angle: 120 }); // stashed
		expect(box.style.rotate).toBe('0deg'); // suppressed while local owns the node (no-op move wrote 0deg)
		drive('end', 50, 0); // local changed nothing → stashed remote applies
		expect(box.style.rotate).toBe('120deg');
	});

	it('showRemotePresence renders a peer rotation; clear eases back to the committed angle', () => {
		const { box, handle } = setup();
		handle.applyExternal({ type: 'rotate', target: 'knob', angle: 30 }); // committed home
		handle.showRemotePresence({ type: 'rotate', target: 'knob', peerId: 'A', angle: 120 });
		expect(box.style.rotate).toBe('120deg');
		handle.clearRemotePresence('A');
		expect(box.style.rotate).toBe('30deg');
	});
});
