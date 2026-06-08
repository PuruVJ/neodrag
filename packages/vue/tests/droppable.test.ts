import { createApp, defineComponent, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { accepts } from '@neodrag/core/drop/plugins';
import { useDroppable } from '../src/index.ts';

describe('@neodrag/vue useDroppable', () => {
	test('bind attaches to element', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const DropHarness = defineComponent({
			setup() {
				const { bind } = useDroppable([accepts(() => true)]);
				return () =>
					h('div', {
						...bind.value,
						'data-testid': 'drop',
					});
			},
		});

		const app = createApp(DropHarness);
		app.mount(host);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(host.querySelector('[data-testid="drop"]')).toBeTruthy();

		app.unmount();
		host.remove();
	});
});
