/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { defineDragPlugin } from '../../src/types.ts';
import {
	hasReactiveSlots,
	PluginListResolver,
	resolvePluginList,
} from '../../src/resolve-plugins.ts';

describe('plugin slots resolver', () => {
	it('PluginListResolver caches static resolveFull across calls', () => {
		const key = Symbol('p');
		const p = defineDragPlugin(() => ({ key, name: 'p' }))();
		const resolver = new PluginListResolver([p]);
		const a = resolver.resolveFull();
		const b = resolver.resolveFull();
		expect(a).toBe(b);
		expect(a[0]).toBe(p);
	});

	it('hasReactiveSlots detects function slots', () => {
		const key = Symbol('a');
		const p = defineDragPlugin(() => ({ key }))();
		expect(hasReactiveSlots([p])).toBe(false);
		expect(hasReactiveSlots([p, () => p])).toBe(true);
	});

	it('caches static slots on reactive-only resolve', () => {
		const key = Symbol('static');
		const staticPlugin = defineDragPlugin(() => ({ key }))();
		let dynamicCalls = 0;
		const dynamicKey = Symbol('dynamic');
		const slots = [
			staticPlugin,
			() => {
				dynamicCalls++;
				return defineDragPlugin(() => ({ key: dynamicKey }))();
			},
		];

		const cache: (typeof staticPlugin | undefined)[] = [];
		const first = resolvePluginList(slots, cache, false);
		expect(first).toHaveLength(2);
		expect(dynamicCalls).toBe(1);

		dynamicCalls = 0;
		const second = resolvePluginList(slots, cache, true);
		expect(second[0]).toBe(staticPlugin);
		expect(dynamicCalls).toBe(1);
	});

	it('PluginListResolver resolveReactive skips static re-init', () => {
		const key = Symbol('s');
		const staticPlugin = defineDragPlugin(() => ({ key }))();
		let n = 0;
		const resolver = new PluginListResolver([
			staticPlugin,
			() => {
				n++;
				return defineDragPlugin(() => ({ key: Symbol('d') }))();
			},
		]);

		resolver.resolveFull();
		n = 0;
		resolver.resolveReactive();
		expect(n).toBe(1);
	});

	it('resolveAttach skips reactive slot invocation', () => {
		let calls = 0;
		const key = Symbol('r');
		const resolver = new PluginListResolver([
			() => {
				calls++;
				return defineDragPlugin(() => ({ key }))();
			},
		]);

		expect(resolver.resolveAttach()).toHaveLength(0);
		expect(calls).toBe(0);
	});

	it('flattens array return from slot', () => {
		const a = defineDragPlugin(() => ({ key: Symbol('a') }))();
		const b = defineDragPlugin(() => ({ key: Symbol('b') }))();
		const out = resolvePluginList([() => [a, b]]);
		expect(out).toHaveLength(2);
	});
});
