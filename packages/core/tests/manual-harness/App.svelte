<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { dragData } from '../../src/plugins.ts';
	import { accepts, onDrop } from '../../src/drop/index.ts';
	import { sortable } from '../../src/drop/index.ts';
	import InteractionsBox from '../components/InteractionsBox.svelte';
	import InteractionsSortable from '../components/InteractionsSortable.svelte';

	let tab = $state<'drag' | 'sortable' | 'drop'>('drag');

	let drops = $state(0);

	let items = $state([
		{ id: '1', text: 'One' },
		{ id: '2', text: 'Two' },
		{ id: '3', text: 'Three' },
	]);

	const engine = new Neodrag();
	const list = sortable({
		items: () => items,
		keyBy: (i) => i.id,
		onReorder: (next) => {
			items = next;
		},
	});

	const bindDropZone = (n: HTMLElement) => {
		const h = engine.droppable(n, [
			accepts<{ kind: string }>((d) => d.kind === 'card'),
			onDrop(() => {
				drops++;
			}),
		]);
		return () => h.destroy();
	};

	const bindDragCard = (n: HTMLElement) => {
		const h = engine.draggable(n, [dragData(() => ({ kind: 'card' }))]);
		return () => h.destroy();
	};

	const bindSortList = (n: HTMLElement) => {
		const h = engine.droppable(n, list.container());
		return () => h.destroy();
	};

	const bindSortItem = (n: HTMLElement, plugins: ReturnType<typeof list.item>) => {
		const h = engine.draggable(n, [...plugins]);
		return () => h.destroy();
	};
</script>

<nav>
	<button type="button" data-tab="drag" class:active={tab === 'drag'} onclick={() => (tab = 'drag')}>
		Drag
	</button>
	<button
		type="button"
		data-tab="sortable"
		class:active={tab === 'sortable'}
		onclick={() => (tab = 'sortable')}
	>
		Sortable
	</button>
	<button type="button" data-tab="drop" class:active={tab === 'drop'} onclick={() => (tab = 'drop')}>
		Drop
	</button>
</nav>

{#if tab === 'drag'}
	<InteractionsBox testid="draggable" />
{:else if tab === 'sortable'}
	<ul data-testid="list" {@attach bindSortList}>
		{#each items as item (item.id)}
			<li
				data-testid="item-{item.id}"
				data-sortable-key={item.id}
				{@attach (n) => bindSortItem(n, list.item(item.id))}
			>
				{item.text}
			</li>
		{/each}
	</ul>
{:else}
	<div class="drop-scene">
		<div class="dropzone" data-testid="dropzone" {@attach bindDropZone}>
			<div class="card" data-testid="draggable" {@attach bindDragCard}></div>
		</div>
		<p data-testid="drop-count">{drops}</p>
	</div>
{/if}

<style>
	nav {
		display: flex;
		gap: 8px;
		margin-bottom: 16px;
	}
	button.active {
		font-weight: bold;
	}
	ul {
		list-style: none;
		padding: 0;
		width: 200px;
	}
	li {
		padding: 12px;
		margin: 4px 0;
		background: #b8e0ff;
		cursor: grab;
	}
	.drop-scene {
		width: 400px;
		height: 300px;
	}
	.dropzone {
		width: 100%;
		height: 100%;
		border: 2px dashed #333;
		position: relative;
	}
	.card {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 80px;
		height: 80px;
		background: cyan;
	}
</style>
