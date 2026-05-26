<script lang="ts">
	import type { WorldMeta } from '../worlds';

	type Props = {
		world: WorldMeta;
	};

	const { world }: Props = $props();
</script>

<div class="coming-soon">
	<p class="h2">{world.label}</p>
	<p class="lede">{world.tagline}</p>
	<p class="muted">This world is on the way. Night desk is ready to play now.</p>
</div>

<style>
	.coming-soon {
		display: grid;
		place-content: center;
		align-content: center;
		justify-items: center;
		gap: 0.75rem;
		min-height: 100%;
		padding: 3rem;
		text-align: center;
	}

	.h2 {
		margin: 0;
		font-size: clamp(1.75rem, 5vw, 2.5rem);
	}

	.lede {
		margin: 0;
		font-size: 1.15rem;
		color: color-mix(in lch, var(--app-color-dark), transparent 20%);
	}

	.muted {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: 0.9rem;
		color: color-mix(in lch, var(--app-color-dark), transparent 40%);
	}
</style>
