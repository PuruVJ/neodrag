import { createApp, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { vDraggable } from '../src/index.ts';
import VueReactiveHarness from './VueReactiveHarness.vue';

function translateStyle(el: HTMLElement) {
	return getComputedStyle(el).translate;
}

describe('@neodrag/vue reactivity', () => {
	test('v-draggable binding flushes reactive position slot', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		let external = { x: 6, y: 14 };
		const app = createApp({
			render: () => h(VueReactiveHarness, { external }),
		});
		app.directive('draggable', vDraggable);
		app.mount(host);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el)).toContain('6');
		expect(translateStyle(el)).toContain('14');

		external = { x: 25, y: 35 };
		app.unmount();
		const app2 = createApp({
			render: () => h(VueReactiveHarness, { external }),
		});
		app2.directive('draggable', vDraggable);
		app2.mount(host);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await new Promise((r) => setTimeout(r, 0));

		const el2 = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el2)).toContain('25');
		expect(translateStyle(el2)).toContain('35');

		app2.unmount();
		host.remove();
	});
});
