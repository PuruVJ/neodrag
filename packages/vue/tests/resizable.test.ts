import { createApp, defineComponent, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { resizeHandles } from '@neodrag/core/resize';
import { useResizable } from '../src/index.ts';

describe('@neodrag/vue resizable', () => {
	test('useResizable attaches to element ref', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const ResizeHarness = defineComponent({
			setup() {
				const resize = useResizable([resizeHandles({ edges: ['e'] })]);
				return () =>
					h('div', {
						'data-testid': 'panel',
						ref: (el: HTMLElement | null) => {
							if (el) resize.value.attach(el);
						},
					});
			},
		});

		const app = createApp(ResizeHarness);
		app.mount(host);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		const panel = host.querySelector('[data-testid="panel"]');
		expect(panel).toBeTruthy();
		expect(panel?.querySelector('[data-neodrag-resize-handle="e"]')).toBeTruthy();

		app.unmount();
		host.remove();
	});
});
