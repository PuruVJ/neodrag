import { createApp, defineComponent, h, nextTick, reactive } from 'vue';
import { describe, expect, test } from 'vitest';
import { vDraggable } from '../src/index.ts';
import VueBindHarness from './VueBindHarness.vue';
import VueReactiveHarness from './VueReactiveHarness.vue';

function translateStyle(el: HTMLElement) {
	return getComputedStyle(el).translate;
}

describe('@neodrag/vue reactivity', () => {
	test('v-bind bind flushes reactive position when parent props change', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const external = reactive({ x: 6, y: 14 });
		const Parent = defineComponent({
			setup() {
				return () => h(VueBindHarness, { external });
			},
		});

		const app = createApp(Parent);
		app.mount(host);

		await nextTick();
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el)).toContain('6');
		expect(translateStyle(el)).toContain('14');

		external.x = 25;
		external.y = 35;
		await nextTick();
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		expect(translateStyle(el)).toContain('25');
		expect(translateStyle(el)).toContain('35');

		app.unmount();
		host.remove();
	});

	test('v-draggable flushes reactive position when parent props change', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const external = reactive({ x: 6, y: 14 });
		const Parent = defineComponent({
			setup() {
				return () => h(VueReactiveHarness, { external });
			},
		});

		const app = createApp(Parent);
		app.directive('draggable', vDraggable);
		app.mount(host);

		await nextTick();
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el)).toContain('6');
		expect(translateStyle(el)).toContain('14');

		external.x = 25;
		external.y = 35;
		await nextTick();
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		expect(translateStyle(el)).toContain('25');
		expect(translateStyle(el)).toContain('35');

		app.unmount();
		host.remove();
	});
});
