import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, test } from 'vitest';
import { useSortable, type SortableList } from '../src/use-sortable.ts';

type Item = { id: string; label: string };

describe('@neodrag/react useSortable', () => {
	test('constructs sortable list API and item chips', async () => {
		const host = document.createElement('div');
		document.body.appendChild(host);
		const root = createRoot(host);

		let captured: { list: SortableList<Item>; keys: string[] } | null = null;

		function Probe() {
			const [items] = useState<Item[]>([
				{ id: '1', label: 'One' },
				{ id: '2', label: 'Two' },
			]);
			const { list } = useSortable({
				items,
				keyBy: (item) => item.id,
				onReorder: () => {},
				strategy: 'vertical',
				releaseDuration: 0,
			});
			captured = { list, keys: items.map((i) => i.id) };
			return <div data-testid="probe" />;
		}

		await act(async () => {
			root.render(<Probe />);
		});
		await act(async () => {
			await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		});

		expect(captured).toBeTruthy();
		expect(captured!.list.container).toBeDefined();
		expect(captured!.list.item('1').target).toBeTruthy();
		expect(captured!.list.item('2').target).toBeTruthy();
		expect(captured!.keys).toEqual(['1', '2']);

		root.unmount();
		host.remove();
	});
});
