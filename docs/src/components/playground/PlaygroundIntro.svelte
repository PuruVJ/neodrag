<script lang="ts">
	import { DEFAULT_WORLD, WORLDS, type WorldId } from './worlds';

	type Props = {
		world?: WorldId;
	};

	const { world = DEFAULT_WORLD }: Props = $props();

	const world_meta = $derived(WORLDS.find((w) => w.id === world));
</script>

<header class="intro playground-surface">
	<div class="copy">
		<p class="eyebrow">Everything&rsquo;s a plugin</p>
		<h1>Neodrag</h1>
		<p class="lede">One draggable to rule them all — drag the scene, then peek at the code.</p>
		{#if world_meta}
			<p class="scene-hint">{world_meta.glyph} {world_meta.tagline}</p>
		{/if}
	</div>

	<div class="actions">
		<a class="cta primary" href="/docs/svelte">Getting started</a>
		<a class="cta" href="https://github.com/PuruVJ/neodrag" target="_blank" rel="external">
			GitHub
		</a>
	</div>
</header>

<style>
	@import './playground-chrome.css';

	.intro {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.25rem 2rem;

		padding: 1.25rem 1.5rem;
		border-radius: 1.5rem;
	}

	.copy {
		display: grid;
		gap: 0.35rem;
		min-width: min(100%, 18rem);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: 0.8rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: color-mix(in lch, var(--app-color-dark), transparent 35%);
	}

	h1 {
		margin: 0;
		font-size: clamp(2rem, 5vw, 2.75rem);
		background-image: var(--app-color-primary-gradient);
		background-clip: text;
		-webkit-text-fill-color: transparent;
		line-height: 1.1;
	}

	.lede,
	.scene-hint {
		margin: 0;
		max-width: 36ch;
		color: color-mix(in lch, var(--app-color-dark), transparent 20%);
	}

	.lede {
		font-size: 1.05rem;
	}

	.scene-hint {
		font-size: 0.9rem;
		font-family: var(--app-font-mono);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.55rem 1.1rem;
		border-radius: 999px;
		font-size: 0.95rem;
		font-weight: 600;
		text-decoration: none;
		color: color-mix(in lch, var(--app-color-dark), transparent 10%);
		background: color-mix(in lch, var(--app-color-shell), transparent 35%);
		box-shadow:
			inset 0 0 0 0.2px color-mix(in lch, var(--gray-9), transparent 50%),
			0 1px 2px hsla(0, 0%, 0%, 0.08);

		&.primary {
			color: var(--app-color-primary-contrast);
			background: var(--app-color-primary);
		}

		&:hover {
			filter: brightness(1.03);
		}
	}
</style>
