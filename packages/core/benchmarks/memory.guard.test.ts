/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { Neodrag } from '../src/index.ts';
import { DragInstance } from '../src/interactions/instance.ts';
import { createDraggableNode, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';
import { createDragSession } from '../src/interactions/session.ts';
import { SessionPrivate } from '../src/interactions/instance.ts';

const gc = (globalThis as { gc?: () => void }).gc;

function snapshot() {
	gc?.();
	return process.memoryUsage().heapUsed;
}

function mb(n: number) {
	return Math.round((n / 1024 / 1024) * 100) / 100;
}

const DRAG = { fromX: 120, fromY: 120, toX: 220, toY: 220, steps: 12 };
const N = 40;

afterEach(() => resetBody());

describe('memory snapshots', () => {
	it('Neodrag default: peak and cleanup', () => {
		const before = snapshot();
		const engine = new Neodrag();
		const nodes: HTMLDivElement[] = [];
		const handles: Array<{ destroy: () => void }> = [];

		for (let i = 0; i < N; i++) {
			const node = createDraggableNode();
			nodes.push(node);
			handles.push(engine.draggable(node, []));
		}
		for (const node of nodes) simulateDragSteps(node, DRAG);

		const peak = snapshot();
		for (const h of handles) h.destroy();
		engine.dispose();
		resetBody();
		const after = snapshot();

		const peakDelta = peak - before;
		const retained = after - before;

		console.log(
			`[memory Neodrag default] peak +${mb(peakDelta)}MB (~${Math.round(peakDelta / N)} B/instance), retained ${mb(retained)}MB`,
		);

		expect(retained).toBeLessThan(4 * 1024 * 1024);
	});

	it('DragInstance only: 5000 instances', () => {
		const idleActive = {
			state: 'idle' as const,
			sourceNode: document.documentElement,
			visualNode: document.documentElement,
			sourceRect: new DOMRect(),
			visualRect: new DOMRect(),
			pointerX: 0,
			pointerY: 0,
			deltaX: 0,
			deltaY: 0,
			data: undefined,
			overTargets: [],
			private: new SessionPrivate(),
			propagationStopped: false,
			pointerId: -1,
			startedAt: 0,
			cancel() {},
		};
		const idleSession = createDragSession(idleActive, () => {});
		const node = document.createElement('div');

		const before = snapshot();
		const list: DragInstance[] = [];
		for (let i = 0; i < 5000; i++) list.push(new DragInstance(node, idleSession));
		const peak = snapshot();
		list.length = 0;
		const after = snapshot();

		const per = (peak - before) / 5000;
		console.log(
			`[memory DragInstance×5000] peak +${mb(peak - before)}MB (~${Math.round(per)} B/instance), after clear retained ${mb(after - before)}MB`,
		);

		expect(after - before).toBeLessThan(peak - before);
	});
});
