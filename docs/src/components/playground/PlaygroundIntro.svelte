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
			<a class="cta" href="/docs/svelte">Getting started</a>
			<a class="cta secondary unstyled" href="https://github.com/PuruVJ/neodrag" target="_blank" rel="external">
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
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		width: min(100%, 22rem);
	}

	.cta {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 1rem 1.5rem;
		border-radius: 1rem !important;
		font-size: clamp(1rem, 2vw, 1.35rem);
		text-align: center;
		color: var(--app-color-primary);
	}

	.cta.secondary {
		color: var(--app-color-primary);
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
			width: 100%;
		}
	}

	@media (max-width: 768px) {
		.actions {
			grid-template-columns: 1fr;
		}

		.cta {
			font-size: 1rem;
			padding: 0.75rem 1rem;
		}
	}
</style>
