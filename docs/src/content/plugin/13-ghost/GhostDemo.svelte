<script lang="ts">
	import { Draggable, ghost } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `ghost` is a use:[] extra. A translucent clone follows the pointer in a shared overlay layer
	// while the original stays exactly where it is — so there's nothing to reset.
	const drag = new Draggable({
		use: [ghost({ opacity: 0.5 })],
	});
</script>

<DocDemo label="Drag the box — a translucent clone follows, the original stays put" hint="ghost — opacity: 0.5">
	{#snippet stage()}
		<button class="gh-box" {...drag.attach}>ghost</button>
	{/snippet}
</DocDemo>

<style>
	.gh-box {
		display: grid;
		place-items: center;
		width: 5rem;
		height: 5rem;
		font: 700 0.82rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
	}
</style>
