<script lang="ts">
	import { SortableList } from '@neodrag/svelte/sortable';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	type Card = { id: string; text: string };
	const TODO_SEED: Card[] = [
		{ id: 't1', text: 'Draft' },
		{ id: 't2', text: 'Design' },
		{ id: 't3', text: 'Build' },
	];
	const DONE_SEED: Card[] = [{ id: 'd1', text: 'Ship' }];

	const GROUP = 'doc-board';

	let todo = $state<Card[]>(TODO_SEED.map((c) => ({ ...c })));
	let done = $state<Card[]>(DONE_SEED.map((c) => ({ ...c })));

	const todoList = new SortableList<Card>({
		get items() {
			return todo;
		},
		id: 'todo',
		group: GROUP,
		onReorder: (next) => (todo = next),
		onTransfer: ({ item, to }) => (todo = [...todo.slice(0, to), item, ...todo.slice(to)]),
		animation: 200,
	});

	const doneList = new SortableList<Card>({
		get items() {
			return done;
		},
		id: 'done',
		group: GROUP,
		onReorder: (next) => (done = next),
		onTransfer: ({ item, to }) => (done = [...done.slice(0, to), item, ...done.slice(to)]),
		animation: 200,
	});

	function reset() {
		todo = TODO_SEED.map((c) => ({ ...c }));
		done = DONE_SEED.map((c) => ({ ...c }));
	}
</script>

<DocDemo label="group — drag cards between two lists" hint="shared group string makes lists transfer-aware" {reset}>
	{#snippet stage()}
		<div class="gp">
			<div class="gp-col">
				<span class="gp-head">Todo</span>
				<ul class="gp-list" {...todoList.attach}>
					{#each todo as card (card.id)}
						<li class="gp-card" {...todoList.row(card.id)}>{card.text}</li>
					{/each}
				</ul>
			</div>
			<div class="gp-col">
				<span class="gp-head">Done</span>
				<ul class="gp-list" {...doneList.attach}>
					{#each done as card (card.id)}
						<li class="gp-card" {...doneList.row(card.id)}>{card.text}</li>
					{/each}
				</ul>
			</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.gp {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		width: min(22rem, 100%);
	}
	.gp-col {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.gp-head {
		font: 600 0.68rem var(--app-font-mono);
		color: var(--color-fg-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.gp-list {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-height: 7rem;
		margin: 0;
		padding: 0.4rem;
		list-style: none;
		background: color-mix(in lch, var(--app-color-shell), transparent 40%);
		border: 1px dashed var(--color-border-strong);
		border-radius: 10px;
	}
	.gp-card {
		box-sizing: border-box;
		padding: 0.5rem 0.7rem;
		font: 600 0.8rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 8px;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
</style>
