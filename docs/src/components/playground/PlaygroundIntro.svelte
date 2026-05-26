<script lang="ts">
	import { DEFAULT_WORLD, WORLDS, type WorldId } from './worlds';
	import ScenarioStrip from './ScenarioStrip.svelte';

	type Props = {
		world?: WorldId;
		onworld?: (id: WorldId) => void;
	};

	const { world = DEFAULT_WORLD, onworld }: Props = $props();

	const world_meta = $derived(WORLDS.find((w) => w.id === world));
</script>

<header class="masthead">
	<div class="brand">
		<h1>Neodrag</h1>
		<p class="tagline h4">One draggable to rule them all</p>
		<p class="plugin-line">Everything&rsquo;s a plugin — mostly built-ins, plus your own.</p>
		{#if world_meta}
			<p class="scene-caption">{world_meta.label} · {world_meta.tagline}</p>
		{/if}
	</div>

	<div class="masthead-side">
		<div class="actions">
			<a class="cta primary" href="/docs/svelte">Getting started</a>
			<a class="cta ghost" href="https://github.com/PuruVJ/neodrag" target="_blank" rel="external">
				GitHub
			</a>
		</div>

		{#if onworld}
			<ScenarioStrip active={world} onselect={onworld} />
		{/if}
	</div>
</header>

<style>
	.masthead {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: end;
		gap: clamp(2rem, 6vw, 5rem);
		padding: clamp(0.5rem, 2vw, 1.5rem) 0 clamp(1.5rem, 4vw, 2.5rem);
		min-height: 0;
	}

	.brand {
		display: grid;
		gap: 0.5rem;
		max-width: 42rem;
	}

	h1 {
		margin: 0;
		font-size: clamp(3rem, 14vw, 7.5rem);
		line-height: 1.05;
		background-image: var(--app-color-primary-gradient);
		background-clip: text;
		-webkit-text-fill-color: transparent;
		width: max-content;
	}

	.tagline {
		margin: 0;
		font-size: clamp(1.1rem, 3.5vw, 2rem);
		color: color-mix(in lch, var(--app-color-dark), transparent 8%);
	}

	.plugin-line,
	.scene-caption {
		margin: 0;
		font-size: clamp(0.95rem, 1.8vw, 1.15rem);
		color: color-mix(in lch, var(--app-color-dark), transparent 32%);
	}

	.scene-caption {
		font-family: var(--app-font-mono);
		font-size: 0.9rem;
		margin-top: 0.25rem;
	}

	.masthead-side {
		display: grid;
		gap: 1.25rem;
		justify-items: end;
		min-width: min(100%, 22rem);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		justify-content: flex-end;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.75rem;
		border-radius: 1rem;
		font-size: clamp(1rem, 2vw, 1.35rem);
		font-weight: 600;
		text-decoration: none;
		transition:
			transform 160ms ease,
			filter 160ms ease;

		&:hover {
			transform: translateY(-1px);
		}
	}

	.cta.primary {
		color: var(--app-color-primary-contrast);
		background: var(--app-color-primary);
		box-shadow: 0 10px 32px color-mix(in lch, var(--app-color-primary), transparent 55%);
	}

	.cta.ghost {
		color: var(--app-color-primary);
		background: color-mix(in lch, var(--app-color-primary), transparent 92%);
	}

	@media (max-width: 960px) {
		.masthead {
			grid-template-columns: 1fr;
			align-items: start;
		}

		.masthead-side {
			justify-items: start;
			width: 100%;
		}

		.actions {
			justify-content: flex-start;
		}
	}
</style>
