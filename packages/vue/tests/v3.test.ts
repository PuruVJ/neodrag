import { createApp, h, nextTick } from 'vue';
import { describe, expect, test } from 'vitest';
import { Draggable, useDraggable } from '@neodrag/vue';

describe('@neodrag/vue v3 API', () => {
	test('Draggable class constructs against a node and exposes v3 surface', () => {
		const node = document.createElement('div');
		document.body.appendChild(node);

		const drag = new Draggable(node, { axis: 'x' });
		expect(drag.isDragging).toBe(false);
		expect(drag.offset).toEqual({ x: 0, y: 0 });

		drag.update({ axis: 'y' });
		drag.destroy();
		node.remove();
	});

	test('useDraggable composable binds a ref and tracks dragging state', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);

		const app = createApp({
			setup() {
				const { ref: target, isDragging } = useDraggable({ axis: 'both' });
				return () =>
					h('div', {
						ref: target,
						'data-testid': 'draggable',
						'data-dragging': String(isDragging.value),
					});
			},
		});
		app.mount(host);

		await nextTick();

		const el = host.querySelector('[data-testid="draggable"]') as HTMLElement;
		expect(el).toBeTruthy();
		expect(el.dataset.dragging).toBe('false');

		app.unmount();
		host.remove();
	});
});
