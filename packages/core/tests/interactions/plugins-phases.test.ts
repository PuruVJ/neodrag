/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { createDragSession } from '../../src/interactions/session.ts';
import { DragInstance, SessionPrivate, type ActiveSession } from '../../src/interactions/instance.ts';
import type { DragPlugin } from '../../src/interactions/types.ts';

function idleSession() {
	const active: ActiveSession = {
		state: 'idle',
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
	return createDragSession(active, () => {});
}

describe('plugin phase buckets', () => {
	it('sorts plugins into pre/resolve/post per hook', () => {
		const inst = new DragInstance(document.createElement('div'), idleSession());

		const pre: DragPlugin = {
			key: Symbol('pre'),
			name: 'pre',
			phase: 'pre',
			drag() {},
		};
		const resolve: DragPlugin = {
			key: Symbol('resolve'),
			name: 'resolve',
			phase: 'resolve',
			drag() {},
		};
		const post: DragPlugin = {
			key: Symbol('post'),
			name: 'post',
			phase: 'post',
			drag() {},
		};

		inst.flat = [post, pre, resolve];
		inst.rebuildBuckets();

		expect(inst.preDrag.map((p) => p.name)).toEqual(['pre']);
		expect(inst.resolveDrag.map((p) => p.name)).toEqual(['resolve']);
		expect(inst.postDrag.map((p) => p.name)).toEqual(['post']);
	});

	it('runs drag hooks pre → resolve → post regardless of registration order', () => {
		const inst = new DragInstance(document.createElement('div'), idleSession());
		const order: string[] = [];

		const pre: DragPlugin = {
			key: Symbol('pre'),
			name: 'pre',
			phase: 'pre',
			drag() {
				order.push('pre');
			},
		};
		const resolve: DragPlugin = {
			key: Symbol('resolve'),
			name: 'resolve',
			phase: 'resolve',
			drag() {
				order.push('resolve');
			},
		};
		const post: DragPlugin = {
			key: Symbol('post'),
			name: 'post',
			phase: 'post',
			drag() {
				order.push('post');
			},
		};

		inst.flat = [post, pre, resolve];
		inst.rebuildBuckets();

		expect(inst.dragChain.map((p) => p.name)).toEqual(['pre', 'resolve', 'post']);

		const e = new PointerEvent('pointermove', { clientX: 0, clientY: 0 });
		for (const plugin of inst.dragChain) {
			plugin.drag!(inst.dragCtx, inst.states.get(plugin.key), e);
		}

		expect(order).toEqual(['pre', 'resolve', 'post']);
	});
});
