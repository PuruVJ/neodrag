import { afterEach, describe, expect, it } from 'vitest';
import { Drag } from '../../src/drag/drag.ts';
import type { CollabOp, DragOp, LocalPresence } from '../../src/collab-types.ts';
import { Interactions } from '../../src/engine.ts';
import { input, translate } from './_browser.ts';

function makeNode(): HTMLElement {
	const el = document.createElement('div');
	document.body.appendChild(el);
	return el;
}


/** A peer: its own engine + Drag + node, bound under `id`. */
function makePeer(id: string, options: Parameters<Drag['bind']>[1] = {}) {
	const node = makeNode();
	const dnd = new Interactions({ defaultSensors: false });
	const drag = new Drag();
	dnd.use(drag);
	const handle = drag.bind(node, { id, ...options });
	const drive = (phase: 'start' | 'move' | 'end', x: number, y: number) =>
		({ start: dnd.host.onInteractionStart, move: dnd.host.onInteractionMove, end: dnd.host.onInteractionEnd }[
			phase
		].call(dnd.host, input(node, phase, x, y)));
	return { node, dnd, drag, handle, drive };
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('Drag collab seam', () => {
	it('commits the final offset once on release (the unified drag op)', () => {
		const ops: DragOp[] = [];
		const { drive } = makePeer('box', { onCommit: (op) => ops.push(op) });

		drive('start', 100, 100);
		drive('move', 130, 120);
		drive('move', 150, 140);
		drive('end', 150, 140);

		expect(ops).toEqual([{ type: 'drag', target: 'box', x: 50, y: 40 }]);
	});

	it('skips the commit when the drag never moved', () => {
		const ops: DragOp[] = [];
		const { drive } = makePeer('box', { onCommit: (op) => ops.push(op) });
		drive('start', 100, 100);
		drive('move', 100, 100); // starts the gesture but offset stays 0,0
		drive('end', 100, 100);
		expect(ops).toEqual([]);
	});

	it('streams in-flight presence and a null terminator', () => {
		const frames: (LocalPresence | null)[] = [];
		const { handle, drive } = makePeer('box');
		handle.onPresence((p) => frames.push(p));

		drive('start', 0, 0);
		drive('move', 10, 5);
		drive('move', 20, 12);
		drive('end', 20, 12);

		expect(frames).toEqual([
			{ type: 'drag', target: 'box', x: 10, y: 5 },
			{ type: 'drag', target: 'box', x: 20, y: 12 },
			null,
		]);
	});

	it('applyExternal moves the node to a remote offset; subscriptions compose & unsubscribe', () => {
		const a: DragOp[] = [];
		const b: CollabOp[] = [];
		const { node, handle, drive } = makePeer('box', { onCommit: (op) => a.push(op) });
		const off = handle.onCommit((op) => b.push(op));

		// Remote fact: someone else dropped the box at (40, 25).
		handle.applyExternal({ type: 'drag', target: 'box', x: 40, y: 25 });
		expect(handle.offset).toEqual({ x: 40, y: 25 });
		expect(translate(node)).toEqual({ x: 40, y: 25 });

		// A local drag now commits to BOTH the option and the subscriber.
		drive('start', 0, 0);
		drive('move', 10, 10);
		drive('end', 10, 10);
		expect(a).toHaveLength(1);
		expect(b).toHaveLength(1);

		// After unsubscribe, only the option fires.
		off();
		drive('start', 0, 0);
		drive('move', 5, 0);
		drive('end', 5, 0);
		expect(a).toHaveLength(2);
		expect(b).toHaveLength(1);
	});

	it('a remote apply is suppressed while a local drag owns the node', () => {
		const { node, handle, drive } = makePeer('box');
		drive('start', 0, 0);
		drive('move', 30, 30); // local offset now 30,30
		handle.applyExternal({ type: 'drag', target: 'box', x: 999, y: 999 }); // ignored — local wins
		expect(translate(node)).toEqual({ x: 30, y: 30 });
		drive('end', 30, 30);
	});

	// Regression (review F2): a remote op suppressed mid-drag is applied on end when the local gesture
	// moved nothing — so the suppressed remote value isn't lost forever.
	it('applies a remote op suppressed mid-drag when the local gesture moves nothing', () => {
		const { node, handle, drive } = makePeer('box');
		drive('start', 0, 0);
		drive('move', 0, 0); // no movement
		handle.applyExternal({ type: 'drag', target: 'box', x: 80, y: 50 }); // stashed
		expect(translate(node)).toEqual({ x: 0, y: 0 }); // suppressed while local owns the node
		drive('end', 0, 0); // local gesture moved nothing → the stashed remote applies
		expect(translate(node)).toEqual({ x: 80, y: 50 });
	});

	it('showRemotePresence renders a peer drag; clear eases back to the committed offset', () => {
		const { node, handle } = makePeer('box');
		handle.applyExternal({ type: 'drag', target: 'box', x: 10, y: 10 }); // committed home
		handle.showRemotePresence({ type: 'drag', target: 'box', peerId: 'A', x: 60, y: 40 });
		expect(translate(node)).toEqual({ x: 60, y: 40 });
		handle.clearRemotePresence('A');
		expect(translate(node)).toEqual({ x: 10, y: 10 });
	});
});
