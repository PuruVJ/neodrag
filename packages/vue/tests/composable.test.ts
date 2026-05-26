import { createApp, h, nextTick, reactive } from 'vue';
import { describe, expect, test } from 'vitest';
import { position } from '@neodrag/vue/plugins';
import { useDraggable } from '../src/index.ts';

function translateStyle(el: HTMLElement) {
	return getComputedStyle(el).translate;
}

describe('@neodrag/vue useDraggable', () => {
	test('flushReactive tracks reactive slot dependencies', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const pos = reactive({ x: 1, y: 2 });

		const app = createApp({
			setup() {
				const drag = useDraggable([() => position({ current: { x: pos.x, y: pos.y } })]);
				return () =>
					h('div', {
						'data-testid': 'draggable',
						ref: (el: HTMLElement | null) => {
							if (el) drag.value.attach(el);
						},
					});
			},
		});
		app.mount(host);

		await nextTick();
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(translateStyle(el)).toContain('1');

		pos.x = 9;
		pos.y = 11;
		await nextTick();
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));

		expect(translateStyle(el)).toContain('9');
		expect(translateStyle(el)).toContain('11');

		app.unmount();
		host.remove();
	});
});
