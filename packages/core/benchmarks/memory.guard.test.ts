/**
 * @vitest-environment jsdom
 * Logs heap deltas for manual/CI inspection. Run with:
 * NODE_OPTIONS='--expose-gc' pnpm exec vitest run --config vitest.bench.config.ts benchmarks/memory.guard.test.ts
 */
import { afterEach, describe, expect, it } from 'vitest';
import { DraggableFactory, DEFAULTS } from '../src/index.ts';
import { threshold, transform } from '../src/plugins.ts';
import { createEngine, position, transform as iTransform } from '../src/interactions/index.ts';
import { createDraggableNode, resetBody } from './helpers/dom.ts';
import { simulateDragSteps } from './helpers/pointer.ts';

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
	it('v3 default: peak and cleanup', () => {
		const before = snapshot();
		const factory = new DraggableFactory(DEFAULTS);
		const nodes: HTMLDivElement[] = [];
		const disposers: Array<() => void> = [];

		for (let i = 0; i < N; i++) {
			const node = createDraggableNode();
			nodes.push(node);
			disposers.push(factory.draggable(node, []));
		}
		for (const node of nodes) simulateDragSteps(node, DRAG);

		const peak = snapshot();
		for (const d of disposers) d();
		factory.dispose();
		resetBody();
		const after = snapshot();

		const peakDelta = peak - before;
		const retained = after - before;

		console.log(
			`[memory v3 default] peak +${mb(peakDelta)}MB (~${Math.round(peakDelta / N)} B/instance), retained ${mb(retained)}MB`,
		);

		expect(retained).toBeLessThan(4 * 1024 * 1024);
	});

	it('v4 default: peak and cleanup', () => {
		const before = snapshot();
		const engine = createEngine();
		const nodes: HTMLDivElement[] = [];
		const disposers: Array<() => void> = [];

		for (let i = 0; i < N; i++) {
			const node = createDraggableNode();
			nodes.push(node);
			disposers.push(engine.draggable(node, []));
		}
		for (const node of nodes) simulateDragSteps(node, DRAG);

		const peak = snapshot();
		for (const d of disposers) d();
		engine.dispose();
		resetBody();
		const after = snapshot();

		const peakDelta = peak - before;
		const retained = after - before;

		console.log(
			`[memory v4 default] peak +${mb(peakDelta)}MB (~${Math.round(peakDelta / N)} B/instance), retained ${mb(retained)}MB`,
		);

		expect(retained).toBeLessThan(4 * 1024 * 1024);
	});

	it('DragInstance only: 5000 instances', async () => {
		const { DragInstance } = await import('../src/drag-instance.ts');
		const node = document.createElement('div');
		const before = snapshot();
		const list: InstanceType<typeof DragInstance>[] = [];
		for (let i = 0; i < 5000; i++) list.push(new DragInstance(node));
		const peak = snapshot();
		list.length = 0;
		const after = snapshot();

		const per = (peak - before) / 5000;
		console.log(
			`[memory DragInstance×5000] peak +${mb(peak - before)}MB (~${Math.round(per)} B/instance), after clear retained ${mb(after - before)}MB`,
		);

		expect(per).toBeLessThan(8192);
	});
});
