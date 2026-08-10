<script lang="ts">
	import { Draggable, onMove } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `onMove` observes every move tick without changing the offset. Here it drives a live read-out
	// and a tick counter; the controlled `position` is only so the reset button can recentre.
	let pos = $state({ x: 0, y: 0 });
	let ticks = $state(0);
	const drag = new Draggable({
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
		use: [onMove(() => ticks++)],
	});
</script>

<DocDemo
	label="Drag — onMove fires every tick"
	hint={`x ${Math.round(pos.x)} · y ${Math.round(pos.y)} · ${ticks} ticks`}
	reset={() => {
		pos = { x: 0, y: 0 };
		ticks = 0;
	}}
>
	{#snippet stage()}
		<div class="om-stage">
			<button class="om-box" {...drag.attach}>drag</button>
		</div>
	{/snippet}
</DocDemo>

<style>
	.om-stage {
		display: grid;
		place-items: center;
		width: 100%;
		height: 14rem;
	}
	.om-box {
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
	.om-box:active {
		cursor: grabbing;
	}
</style>
