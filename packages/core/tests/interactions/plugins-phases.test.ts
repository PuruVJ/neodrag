/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { DragInstance } from '../../src/interactions/instance.ts';
import type { DragPlugin } from '../../src/interactions/types.ts';

describe('plugin phase buckets', () => {
	it('sorts plugins into pre/resolve/post per hook', () => {
		const inst = new DragInstance(document.createElement('div') as HTMLElement);
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

		expect(inst.preDrag.map((p) => p.name)).toEqual(['pre']);
		expect(inst.resolveDrag.map((p) => p.name)).toEqual(['resolve']);
		expect(inst.postDrag.map((p) => p.name)).toEqual(['post']);
	});
});
