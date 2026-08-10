<script lang="ts">
	import { SortableList, type TransferOp } from '@neodrag/svelte/sortable';

	type Item = { id: string };

	// Two grouped lists with SEPARATE arrays. Crucially, each onTransfer ONLY ADDS to its own list —
	// it never prunes the source. So the source removal must come from the engine firing the source's
	// onReorder on transfer. (Before that fix, the item duplicated into both lists.)
	let a = $state<Item[]>([{ id: 'a0' }, { id: 'a1' }]);
	let b = $state<Item[]>([{ id: 'b0' }, { id: 'b1' }]);

	const addInto = (which: 'a' | 'b', op: TransferOp<Item>) => {
		if (which === 'a') a = [...a.slice(0, op.to), op.item, ...a.slice(op.to)];
		else b = [...b.slice(0, op.to), op.item, ...b.slice(op.to)];
	};

	const listA = new SortableList<Item>({
		get items() {
			return a;
		},
		id: 'a',
		group: 'addonly',
		axis: 'y',
		onReorder: (next) => (a = next),
		onTransfer: (op) => addInto('a', op),
	});
	const listB = new SortableList<Item>({
		get items() {
			return b;
		},
		id: 'b',
		group: 'addonly',
		axis: 'y',
		onReorder: (next) => (b = next),
		onTransfer: (op) => addInto('b', op),
	});

	export function orderA(): string[] {
		return a.map((x) => x.id);
	}
	export function orderB(): string[] {
		return b.map((x) => x.id);
	}
</script>

<div style="position: relative; height: 320px;">
	<ul
		data-testid="listA"
		{...listA.attach}
		style="position: absolute; top: 60px; left: 40px; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;"
	>
		{#each a as item (item.id)}
			<li
				data-testid="row-{item.id}"
				{...listA.row(item.id)}
				style="box-sizing: border-box; width: 120px; height: 40px; margin: 0; line-height: 40px; text-align: center; background: #cdc; border: 1px solid #575; touch-action: none; user-select: none;"
			>
				{item.id}
			</li>
		{/each}
	</ul>
	<ul
		data-testid="listB"
		{...listB.attach}
		style="position: absolute; top: 60px; left: 240px; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column;"
	>
		{#each b as item (item.id)}
			<li
				data-testid="row-{item.id}"
				{...listB.row(item.id)}
				style="box-sizing: border-box; width: 120px; height: 40px; margin: 0; line-height: 40px; text-align: center; background: #dcc; border: 1px solid #755; touch-action: none; user-select: none;"
			>
				{item.id}
			</li>
		{/each}
	</ul>
</div>
