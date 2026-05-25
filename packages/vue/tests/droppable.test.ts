import { createApp, defineComponent, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { accepts } from '@neodrag/core/drop/plugins';
import { useDroppable } from '../src/index.ts';

describe('@neodrag/vue droppable', () => {
	test('useDroppable attaches to element ref', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const DropHarness = defineComponent({
			setup() {
				const drop = useDroppable([accepts(() => true)]);
				return () =>
					h('div', {
						'data-testid': 'drop',
						ref: (el: HTMLElement | null) => {
							if (el) drop.value.attach(el);
						},
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
