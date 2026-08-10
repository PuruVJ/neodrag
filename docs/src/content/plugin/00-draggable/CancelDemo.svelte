<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	let pos = $state({ x: 0, y: 0 });
	let clicks = $state(0);
	const drag = new Draggable({
		bounds: 'parent',
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});
</script>

<DocDemo label="controls.cancel — the button stays clickable, never drags" reset={() => ((pos = { x: 0, y: 0 }), (clicks = 0))}>
	{#snippet stage()}
		<div class="cn-card" {...drag.attach}>
			<span>drag the card</span>
			<button type="button" class="cn-btn" {...drag.cancel()} onclick={() => (clicks += 1)}>clicked {clicks}×</button>
		</div>
	{/snippet}
</DocDemo>

<style>
	.cn-card {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		align-items: center;
		padding: 1.2rem;
		font: 600 0.8rem var(--app-font-mono);
		color: var(--color-fg);
		background: var(--app-color-shell);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
	}
	.cn-btn {
		padding: 0.4rem 0.8rem;
		font: inherit;
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 999px;
		cursor: pointer;
	}
</style>
