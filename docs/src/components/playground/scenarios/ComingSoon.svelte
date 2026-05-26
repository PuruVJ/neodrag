<script lang="ts">
	import type { WorldMeta } from '../worlds';

	type Props = {
		world: WorldMeta;
	};

	const { world }: Props = $props();
</script>

<div class="coming-soon">
	<span class="glyph" aria-hidden="true">{world.glyph}</span>
	<p class="h3">{world.label}</p>
	<p>{world.tagline}</p>
	<p class="muted">Coming soon — pick Night desk to play now.</p>
</div>

<style>
	.coming-soon {
		display: grid;
		place-items: center;
		align-content: center;
		gap: 0.5rem;
		min-height: 100%;
		padding: 2rem;
		text-align: center;
	}

	.glyph {
		font-size: 2.5rem;
		line-height: 1;
	}

	p {
		margin: 0;
	}

	.muted {
		font-family: var(--app-font-mono);
		font-size: 0.85rem;
		color: color-mix(in lch, var(--app-color-dark), transparent 40%);
	}
</style>
