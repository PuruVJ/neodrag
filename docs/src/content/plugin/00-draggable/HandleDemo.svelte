<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	let pos = $state({ x: 0, y: 0 });
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

<DocDemo label="controls.handle — only the title bar starts a drag" reset={() => (pos = { x: 0, y: 0 })}>
	{#snippet stage()}
		<div class="hd-card" {...drag.attach}>
			<div class="hd-bar" {...drag.handle()}>⠿&nbsp;&nbsp;drag here</div>
			<div class="hd-body">the body isn't a handle</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.hd-card {
		width: 12rem;
		overflow: hidden;
		background: var(--app-color-shell);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
		touch-action: none;
	}
	.hd-bar {
		padding: 0.55rem 0.8rem;
		font: 700 0.78rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		cursor: grab;
	}
	.hd-body {
		padding: 1.1rem 0.8rem;
		font: 500 0.76rem var(--app-font-mono);
		color: var(--color-fg-muted);
		cursor: default;
	}
</style>
