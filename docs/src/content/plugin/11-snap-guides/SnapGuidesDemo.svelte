<script lang="ts">
	import { Draggable, snapGuides } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `snapGuides` is a use:[] extra. While dragging, the box's edges and center snap to the edges
	// and centers of the `targets` (the two grey cards) within `threshold` px, and a guide line
	// flashes on the lock — the Figma alignment move.
	let cardA = $state<HTMLElement>();
	let cardB = $state<HTMLElement>();

	const drag = new Draggable({
		use: [
			snapGuides({
				get targets() {
					return [cardA, cardB].filter(Boolean) as HTMLElement[];
				},
				threshold: 7,
			}),
		],
	});
</script>

<DocDemo
	label="Drag the pink box near a grey card — its edges and center snap, and a guide flashes"
	hint="snapGuides — threshold: 7"
>
	{#snippet stage()}
		<div class="sg-stage">
			<div class="sg-card" bind:this={cardA} style="left: 40px; top: 26px;">align to me</div>
			<div class="sg-card" bind:this={cardB} style="left: 232px; top: 132px;">and me</div>
			<button class="sg-box" {...drag.attach}>drag</button>
		</div>
	{/snippet}
</DocDemo>

<style>
	.sg-stage {
		position: relative;
		width: 100%;
		height: 16rem;
	}
	.sg-card {
		position: absolute;
		display: grid;
		place-items: center;
		width: 8rem;
		height: 4.5rem;
		font: 500 0.72rem var(--app-font-mono);
		color: var(--color-fg-muted);
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 8%);
		border: 1px dashed var(--color-border-strong);
		border-radius: 10px;
	}
	.sg-box {
		position: absolute;
		left: 150px;
		top: 80px;
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
