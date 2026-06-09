<script lang="ts">
	import { SortableList, type TransferOp } from '@neodrag/svelte';

	type Item = { id: string };

	// Two grouped columns side by side. listA at left 40, listB at left 240; 40px rows → slot 40.
	let a = $state<Item[]>([{ id: 'a0' }, { id: 'a1' }]);
	let b = $state<Item[]>([{ id: 'b0' }, { id: 'b1' }]);
	let acceptsB = $state(true);
	let lastTransfer = $state<string | null>(null);

	function transferInto(which: 'a' | 'b', op: TransferOp<Item>) {
		const item = op.item;
		a = a.filter((x) => x.id !== item.id);
		b = b.filter((x) => x.id !== item.id);
		if (which === 'a') a = [...a.slice(0, op.to), item, ...a.slice(op.to)];
		else b = [...b.slice(0, op.to), item, ...b.slice(op.to)];
		lastTransfer = `${item.id}->${which}`;
	}

	const listA = new SortableList<Item>({
		get items() {
			return a;
		},
		group: 'k',
		axis: 'y',
		animation: 200,
		onReorder: (next) => (a = next),
		onTransfer: (op) => transferInto('a', op),
	});
	const listB = new SortableList<Item>({
		get items() {
			return b;
		},
		group: 'k',
		axis: 'y',
		animation: 200,
		accepts: () => acceptsB,
		onReorder: (next) => (b = next),
		onTransfer: (op) => transferInto('b', op),
	});

	export function orderA(): string[] {
		return a.map((x) => x.id);
	}
	export function orderB(): string[] {
		return b.map((x) => x.id);
	}
	export function lastTransferOp(): string | null {
		return lastTransfer;
	}
	export function setAcceptsB(v: boolean): void {
		acceptsB = v;
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
				{...listA.row(item)}
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
				{...listB.row(item)}
				style="box-sizing: border-box; width: 120px; height: 40px; margin: 0; line-height: 40px; text-align: center; background: #dcc; border: 1px solid #755; touch-action: none; user-select: none;"
			>
				{item.id}
			</li>
		{/each}
	</ul>
</div>
