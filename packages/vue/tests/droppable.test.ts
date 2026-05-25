import { createApp, defineComponent, h } from 'vue';
import { describe, expect, test } from 'vitest';
import { accepts } from '@neodrag/core/drop/plugins';
import { useDroppable, vDroppable } from '../src/index.ts';

const DropHarness = defineComponent({
	setup() {
		const drop = useDroppable([accepts(() => true)]);
		return { drop };
	},
	template: `<div v-droppable="drop" data-testid="drop" style="width:120px;height:80px" />`,
});

describe('@neodrag/vue droppable', () => {
	test('useDroppable and v-droppable attach', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const app = createApp(DropHarness);
		app.directive('droppable', vDroppable);
		app.mount(host);

		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		expect(host.querySelector('[data-testid="drop"]')).toBeTruthy();

		app.unmount();
		host.remove();
	});
});
