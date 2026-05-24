/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { defineDragPlugin } from '../../src/interactions/types.ts';
import {
	hasReactiveSlots,
	PluginListResolver,
	resolvePluginList,
} from '../../src/interactions/resolve-plugins.ts';

describe('plugin slots resolver', () => {
	it('hasReactiveSlots detects function slots', () => {
		const key = Symbol('a');
		const p = defineDragPlugin(() => ({ key, name: 'a' }))();
		expect(hasReactiveSlots([p])).toBe(false);
		expect(hasReactiveSlots([p, () => p])).toBe(true);
	});

	it('caches static slots on reactive-only resolve', () => {
		const key = Symbol('static');
		const staticPlugin = defineDragPlugin(() => ({ key, name: 'static' }))();
		let dynamicCalls = 0;
		const dynamicKey = Symbol('dynamic');
		const slots = [
			staticPlugin,
			() => {
				dynamicCalls++;
				return defineDragPlugin(() => ({ key: dynamicKey, name: 'dynamic' }))();
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
		const staticPlugin = defineDragPlugin(() => ({ key, name: 's' }))();
		let n = 0;
		const resolver = new PluginListResolver([
			staticPlugin,
			() => {
				n++;
				return defineDragPlugin(() => ({ key: Symbol('d'), name: 'd' }))();
			},
		]);

		resolver.resolveFull();
		n = 0;
		resolver.resolveReactive();
		expect(n).toBe(1);
	});

	it('flattens array return from slot', () => {
		const a = defineDragPlugin(() => ({ key: Symbol('a'), name: 'a' }))();
		const b = defineDragPlugin(() => ({ key: Symbol('b'), name: 'b' }))();
		const out = resolvePluginList([() => [a, b]]);
		expect(out).toHaveLength(2);
	});
});
