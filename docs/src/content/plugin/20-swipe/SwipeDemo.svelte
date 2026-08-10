<script lang="ts">
	import { Swipeable } from '@neodrag/svelte/swipe';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `Swipeable` follows the pointer on one axis; released past the threshold it flies out and fires
	// onDismiss, otherwise it springs back. `swipe.reset()` brings a dismissed card back.
	const swipe = new Swipeable({ axis: 'x', threshold: 0.4 });
</script>

<DocDemo
	label="Drag the card left or right — past 40% it flies out, otherwise it springs back"
	hint={swipe.isDismissed ? 'dismissed' : 'swipe me'}
	reset={() => swipe.reset()}
>
	{#snippet stage()}
		<div class="sw-stage">
			<div class="sw-card" {...swipe.attach}>swipe me away</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.sw-stage {
		display: grid;
		place-items: center;
		width: 100%;
		height: 14rem;
		overflow: hidden;
	}
	.sw-card {
		display: grid;
		place-items: center;
		width: 14rem;
		height: 5rem;
		font: 700 0.82rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 14px;
		cursor: grab;
		touch-action: pan-y;
		box-shadow: 0 6px 20px color-mix(in lch, var(--color-brand), transparent 65%);
	}
	.sw-card:active {
		cursor: grabbing;
	}
</style>
