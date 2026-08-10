import { afterEach, describe, expect, it } from 'vitest';
import { Interactions } from '../../src/engine.ts';
import { Resize, type ResizeEdge, type ResizeOptions } from '../../src/resize/resize.ts';
import type { CollabOp, LocalPresence, ResizeOp } from '../../src/collab-types.ts';
import { input, mockRect, translate } from './_browser.ts';


function setup(options: ResizeOptions = {}, edge: ResizeEdge = 'se') {
	const box = document.createElement('div');
	// Positioned so a west/north resize has a `left`/`top` to shift (and computed style returns px).
	box.style.position = 'absolute';
	box.style.left = '0px';
	box.style.top = '0px';
	const handle = document.createElement('div');
	handle.setAttribute('data-neodrag-resize-handle', edge);
	box.appendChild(handle);
	document.body.appendChild(box);
	mockRect(box, { left: 0, top: 0, right: 100, bottom: 80 }); // 100×80
	const dnd = new Interactions({ defaultSensors: false });
	const resize = new Resize();
	dnd.use(resize);
	const h = resize.bind(box, { id: 'panel', ...options });
	const drive = (phase: 'start' | 'move' | 'end', x: number, y: number) =>
		({ start: dnd.host.onInteractionStart, move: dnd.host.onInteractionMove, end: dnd.host.onInteractionEnd }[
			phase
		].call(dnd.host, input(handle, phase, x, y)));
	return { box, handle: h, drive };
}

/** An SVG <rect> resizable. SVG geometry can't nest an HTML resize handle, so the gesture path
 *  isn't driven here — we exercise the convergence-critical *receiving* side (applyExternal +
 *  presence), which is where size-only sync used to diverge, via the x/y geometry attributes. */
function setupSvg(options: ResizeOptions = {}) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	rect.setAttribute('x', '0');
	rect.setAttribute('y', '0');
	rect.setAttribute('width', '100');
	rect.setAttribute('height', '80');
	svg.appendChild(rect);
	document.body.appendChild(svg);
	mockRect(rect, { left: 0, top: 0, right: 100, bottom: 80 });
	const dnd = new Interactions({ defaultSensors: false });
	const resize = new Resize();
	dnd.use(resize);
	const h = resize.bind(rect, { id: 'svg-panel', ...options });
	return { rect, handle: h };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Resize collab seam', () => {
	it('commits the final size once on release (the unified resize op)', () => {
		const ops: ResizeOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) });
		drive('start', 100, 80);
		drive('move', 130, 110);
		drive('end', 130, 110);
		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 130, height: 110 }]);
	});

	it('skips the commit when the size never changed', () => {
		const ops: ResizeOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) });
		drive('start', 100, 80);
		drive('move', 100, 80); // no delta
		drive('end', 100, 80);
		expect(ops).toEqual([]);
	});

	it('streams in-flight presence and a null terminator', () => {
		const frames: (LocalPresence | null)[] = [];
		const { handle, drive } = setup();
		handle.onPresence((p) => frames.push(p));
		drive('start', 100, 80);
		drive('move', 120, 80);
		drive('move', 140, 100);
		drive('end', 140, 100);
		expect(frames).toEqual([
			{ type: 'resize', target: 'panel', width: 120, height: 80 },
			{ type: 'resize', target: 'panel', width: 140, height: 100 },
			null,
		]);
	});

	it('applyExternal sizes the node to a remote size; subscriptions compose & unsubscribe', () => {
		const a: ResizeOp[] = [];
		const b: CollabOp[] = [];
		const { box, handle, drive } = setup({ onCommit: (op) => a.push(op) });
		const off = handle.onCommit((op) => b.push(op));

		handle.applyExternal({ type: 'resize', target: 'panel', width: 200, height: 150 });
		expect(box.style.width).toBe('200px');
		expect(box.style.height).toBe('150px');
		expect(handle.size).toEqual({ width: 200, height: 150 });

		drive('start', 100, 80);
		drive('move', 110, 90);
		drive('end', 110, 90);
		expect(a).toHaveLength(1);
		expect(b).toHaveLength(1);

		off();
		drive('start', 100, 80);
		drive('move', 130, 80);
		drive('end', 130, 80);
		expect(a).toHaveLength(2);
		expect(b).toHaveLength(1);
	});

	it('a remote apply is suppressed while a local resize owns the node', () => {
		const { box, handle, drive } = setup();
		drive('start', 100, 80);
		drive('move', 140, 120); // local size 140×120
		handle.applyExternal({ type: 'resize', target: 'panel', width: 999, height: 999 }); // ignored
		expect(box.style.width).toBe('140px');
		expect(box.style.height).toBe('120px');
		drive('end', 140, 120);
	});

	it('showRemotePresence renders a peer resize; clear eases back to the committed size', () => {
		const { box, handle } = setup();
		handle.applyExternal({ type: 'resize', target: 'panel', width: 100, height: 80 }); // committed home
		handle.showRemotePresence({ type: 'resize', target: 'panel', peerId: 'A', width: 220, height: 160 });
		expect(box.style.width).toBe('220px');
		handle.clearRemotePresence('A');
		expect(box.style.width).toBe('100px');
		expect(box.style.height).toBe('80px');
	});

	// Regression (review F1): a peer that only ever saw remote PRESENCE (never a commit) must not
	// collapse to 0×0 on clear — the home layout size is the real revert target.
	it('presence-then-clear with no prior commit reverts to the layout size, not 0×0', () => {
		const { box, handle } = setup(); // box laid out 100×80, never resized, no commit
		handle.showRemotePresence({ type: 'resize', target: 'panel', peerId: 'A', width: 220, height: 160 });
		expect(box.style.width).toBe('220px');
		handle.clearRemotePresence('A');
		expect(box.style.width).toBe('100px');
		expect(box.style.height).toBe('80px');
	});

	// Regression (review F2): a remote op suppressed during a local resize is applied on end when the
	// local gesture committed nothing — so the suppressed remote value isn't lost forever.
	it('applies a remote op suppressed mid-resize when the local gesture commits nothing', () => {
		const { box, handle, drive } = setup();
		drive('start', 100, 80);
		drive('move', 100, 80); // no size change
		handle.applyExternal({ type: 'resize', target: 'panel', width: 300, height: 200 }); // stashed
		expect(box.style.width).toBe('100px'); // suppressed while the local gesture owns the node
		drive('end', 100, 80); // local gesture changed nothing → the stashed remote applies
		expect(box.style.width).toBe('300px');
		expect(box.style.height).toBe('200px');
	});
});

describe('Resize collab seam — position sync (west/north)', () => {
	it('a west resize carries left in the commit op (far edge pinned)', () => {
		const ops: ResizeOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) }, 'w');
		// Drag the west handle left by 30 → width grows to 130, left shifts to -30 (right edge pinned).
		drive('start', 0, 40);
		drive('move', -30, 40);
		drive('end', -30, 40);
		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 130, height: 80, left: -30, top: 0 }]);
	});

	it('a north resize carries top in the commit op', () => {
		const ops: ResizeOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) }, 'n');
		drive('start', 50, 0);
		drive('move', 50, -20); // height grows to 100, top shifts to -20 (bottom edge pinned)
		drive('end', 50, -20);
		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 100, height: 100, left: 0, top: -20 }]);
	});

	it('an east resize carries NO position (far edge moves, near edge pinned)', () => {
		const ops: ResizeOp[] = [];
		const { drive } = setup({ onCommit: (op) => ops.push(op) }, 'e');
		drive('start', 100, 40);
		drive('move', 130, 40);
		drive('end', 130, 40);
		expect(ops).toEqual([{ type: 'resize', target: 'panel', width: 130, height: 80 }]);
	});

	it('applyExternal writes left/top from a remote west/north resize', () => {
		const { box, handle } = setup({}, 'nw');
		handle.applyExternal({ type: 'resize', target: 'panel', width: 140, height: 120, left: -40, top: -40 });
		expect(box.style.width).toBe('140px');
		expect(box.style.height).toBe('120px');
		expect(translate(box)).toEqual({ x: -40, y: -40 });
	});

	it('a remote size-only op (east/south peer) leaves position untouched', () => {
		const { box, handle } = setup({}, 'se');
		box.style.left = '10px';
		box.style.top = '20px';
		handle.applyExternal({ type: 'resize', target: 'panel', width: 200, height: 150 });
		expect(box.style.width).toBe('200px');
		expect(box.style.left).toBe('10px'); // unchanged — no position in the op
		expect(box.style.top).toBe('20px');
	});

	it('showRemotePresence renders a peer position; clear eases back to the committed left/top', () => {
		const { box, handle } = setup({}, 'nw');
		handle.applyExternal({ type: 'resize', target: 'panel', width: 100, height: 80, left: 0, top: 0 }); // home
		handle.showRemotePresence({ type: 'resize', target: 'panel', peerId: 'A', width: 140, height: 120, left: -40, top: -40 });
		expect(translate(box)).toEqual({ x: -40, y: -40 });
		handle.clearRemotePresence('A');
		expect(translate(box)).toEqual({ x: 0, y: 0 });
	});

	it('SVG geometry syncs position via x/y attributes', () => {
		const { rect, handle } = setupSvg();
		handle.applyExternal({ type: 'resize', target: 'svg-panel', width: 140, height: 120, left: -40, top: -30 });
		expect(rect.getAttribute('width')).toBe('140');
		expect(rect.getAttribute('height')).toBe('120');
		expect(rect.getAttribute('x')).toBe('-40');
		expect(rect.getAttribute('y')).toBe('-30');
	});
});
