<script lang="ts">
	import { SortableList } from '@neodrag/svelte/sortable';

	type Item = { id: string };

	// 40px-tall rows in a column at a known origin → slot = 40px, predictable rects.
	let items = $state<Item[]>([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
	let reorders = $state(0);
	let indicatorMode = $state<'push' | 'line'>('push');

	const list = new SortableList<Item>({
		get items() {
			return items;
		},
		axis: 'y',
		animation: 200,
		get indicator() {
			return indicatorMode;
		},
		onReorder: (next) => {
			reorders += 1;
			items = next;
		},
	});

	export function order(): string[] {
		return items.map((i) => i.id);
	}
	export function reorderCount(): number {
		return reorders;
	}
	export function setIndicator(m: 'push' | 'line'): void {
		indicatorMode = m;
	}
</script>

<ul
	data-testid="list"
	{...list.attach}
	style="position: absolute; top: 60px; left: 60px; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;"
>
	{#each items as item (item.id)}
		<li
			data-testid="row-{item.id}"
			{...list.row(item.id)}
			style="box-sizing: border-box; width: 120px; height: 40px; margin: 0; line-height: 40px; text-align: center; background: #ccd; border: 1px solid #557; touch-action: none; user-select: none;"
		>
			{item.id}
		</li>
	{/each}
</ul>
