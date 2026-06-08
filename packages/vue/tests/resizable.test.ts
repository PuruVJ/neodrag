import { createApp, defineComponent, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { resizeHandles } from '@neodrag/core/resize';
import { useResizable } from '../src/index.ts';

describe('@neodrag/vue useResizable', () => {
	test('bind attaches resize handles', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const Panel = defineComponent({
			setup() {
				const { bind } = useResizable([resizeHandles({ edges: ['e'] })]);
				return () =>
					h('div', {
						...bind.value,
						'data-testid': 'panel',
						style: { width: '120px', height: '80px' },
					});
			},
		});

		const app = createApp(Panel);
		app.mount(host);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		const panel = host.querySelector('[data-testid="panel"]');
		expect(panel).toBeTruthy();
		expect(panel?.querySelector('[data-neodrag-resize-handle="e"]')).toBeTruthy();

		app.unmount();
		host.remove();
	});
});
