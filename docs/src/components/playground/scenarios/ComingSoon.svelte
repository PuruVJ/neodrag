<script lang="ts">
	import type { WorldMeta } from '../worlds';

	type Props = {
		world: WorldMeta;
	};

	const { world }: Props = $props();
</script>

<div class="hp-coming-soon">
	<p class="hp-coming-soon-title">{world.label}</p>
	<p class="hp-coming-soon-tagline">{world.tagline}</p>
	<p class="hp-coming-soon-note">
		<span aria-hidden="true">▍</span>
		ships soon — <a class="unstyled" href="#night-desk">night desk</a> is live above
	</p>
</div>

<style>
	.hp-coming-soon {
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.65rem;
		min-height: 100%;
		padding: 3rem 2rem;
		text-align: center;
	}

	.hp-coming-soon-glyph {
		margin: 0;
		font-size: clamp(2.5rem, 8vw, 3.5rem);
		line-height: 1;
		filter: grayscale(0.35);
	}

	.hp-coming-soon-title {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 900;
		letter-spacing: -0.03em;
	}

	.hp-coming-soon-tagline {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 500;
		color: color-mix(in lch, var(--app-color-dark), transparent 22%);
	}

	.hp-coming-soon-note {
		margin: 0.35rem 0 0;
		font-family: var(--app-font-mono);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: color-mix(in lch, var(--app-color-dark), transparent 38%);
	}

	.hp-coming-soon-note a {
		color: var(--app-color-primary);
		font-weight: 800;
	}
</style>
