<script lang="ts">
	import { SortableList } from '@neodrag/svelte/sortable';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	type Item = { id: string; label: string };
	const SEED: Item[] = [
		{ id: '1', label: 'Inbox' },
		{ id: '2', label: 'Drafts' },
		{ id: '3', label: 'Sent' },
		{ id: '4', label: 'Archive' },
	];

	let indicator = $state<'push' | 'line'>('push');
	let items = $state<Item[]>(SEED.map((i) => ({ ...i })));
	const list = new SortableList<Item>({
		get items() {
			return items;
		},
		get indicator() {
			return indicator;
		},
		onReorder: (next) => (items = next),
		animation: 200,
	});

	function reset() {
		items = SEED.map((i) => ({ ...i }));
	}
</script>

<DocDemo label="indicator — gap vs. drop-line preview" hint="commit is identical; only the preview differs" {reset}>
	{#snippet controls()}
		<span>indicator:</span>
		{#each ['push', 'line'] as const as mode (mode)}
			<button type="button" aria-pressed={indicator === mode} onclick={() => (indicator = mode)}>{mode}</button>
		{/each}
	{/snippet}
	{#snippet stage()}
		<ul class="il" {...list.attach}>
			{#each items as item (item.id)}
				<li class="il-row" {...list.row(item.id)}>{item.label}</li>
			{/each}
		</ul>
	{/snippet}
</DocDemo>

<style>
	.il {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		width: min(16rem, 80%);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.il-row {
		box-sizing: border-box;
		padding: 0.6rem 0.85rem;
		font: 600 0.82rem var(--app-font-mono);
		color: var(--color-fg);
		background: var(--app-color-shell);
		border: 2px solid var(--color-border-strong);
		border-radius: 10px;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
	.il :global([data-neodrag-sortable-indicator]) {
		background: var(--color-brand);
		border-radius: 999px;
	}
	.il :global([data-neodrag-sortable-ghost]) {
		opacity: 0.4;
	}
</style>
