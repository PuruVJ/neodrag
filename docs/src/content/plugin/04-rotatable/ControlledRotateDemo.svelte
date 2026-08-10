<script lang="ts">
	import { Rotatable } from '@neodrag/svelte/rotate';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// Two-way `angle`: the getter feeds the controlled angle in, the setter writes the live angle
	// back out each move. So the grip drives the slider AND the slider drives the card.
	let angle = $state(30);
	const rotate = new Rotatable({
		origin: 'center',
		get angle() {
			return angle;
		},
		set angle(v) {
			angle = v;
		},
	});
</script>

<DocDemo
	label="Controlled angle — the grip and the slider stay in sync"
	hint="get/set angle ·  bind:value drives it both ways"
	reset={() => (angle = 0)}
>
	{#snippet stage()}
		<div class="cr-wrap">
			<div class="cr-card" class:is-rotating={rotate.isRotating} {...rotate.attach}>
				<span class="cr-angle">{Math.round(angle)}°</span>
				<span class="cr-grip" {...rotate.handle('top')} aria-hidden="true"></span>
			</div>
			<input
				class="cr-slider"
				type="range"
				min="-180"
				max="180"
				bind:value={angle}
				aria-label="angle"
			/>
		</div>
	{/snippet}
</DocDemo>

<style>
	.cr-wrap {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		align-items: center;
		justify-content: center;
	}
	.cr-card {
		position: relative;
		width: 9rem;
		height: 5.5rem;
		display: grid;
		place-items: center;
		font: 800 1rem var(--app-font-mono);
		color: var(--color-fg);
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 8%);
		border: 2px solid var(--color-border-strong);
		border-radius: 12px;
		touch-action: none;
	}
	.cr-card.is-rotating {
		border-color: var(--color-brand);
	}
	.cr-grip {
		position: absolute;
		top: -30px;
		left: 50%;
		width: 15px;
		height: 15px;
		margin-left: -7.5px;
		border-radius: 50%;
		background: var(--color-brand);
		cursor: grab;
	}
	.cr-slider {
		width: 12rem;
		accent-color: var(--color-brand);
	}
</style>
