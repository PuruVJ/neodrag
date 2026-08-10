<script lang="ts">
	import { Rotatable } from '@neodrag/svelte/rotate';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Author the grip as a child; neodrag claims a pointer-down on `data-neodrag-rotate-handle` and
	// writes the individual `rotate` property. Reads back the live angle.
	const rotate = new Rotatable({ origin: 'center', step: 1 });
</script>

<DocDemo label="Spin the card from its grip" hint="origin: center · reads rotate.angle">
	{#snippet stage()}
		<div class="ro-card" class:is-rotating={rotate.isRotating} {...rotate.attach}>
			<span class="ro-angle">{Math.round(rotate.angle)}°</span>
			<span class="ro-stem" aria-hidden="true"></span>
			<span class="ro-grip" {...rotate.handle('top')} aria-hidden="true"></span>
		</div>
	{/snippet}
</DocDemo>

<style>
	.ro-card {
		position: absolute;
		top: 3rem;
		left: 50%;
		margin-left: -4.5rem;
		width: 9rem;
		height: 6rem;
		display: grid;
		place-items: center;
		font: 800 1rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 8%);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
		touch-action: none;
	}
	.ro-card.is-rotating {
		border-color: var(--color-brand);
	}
	.ro-stem {
		position: absolute;
		top: -26px;
		left: 50%;
		width: 2px;
		height: 24px;
		margin-left: -1px;
		background: var(--color-border-strong);
	}
	.ro-grip {
		position: absolute;
		top: -34px;
		left: 50%;
		width: 16px;
		height: 16px;
		margin-left: -8px;
		border-radius: 50%;
		background: var(--color-brand);
		cursor: grab;
	}
	.ro-grip:active {
		cursor: grabbing;
	}
</style>
