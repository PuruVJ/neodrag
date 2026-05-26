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

<header class="hp-masthead">
	<p class="hp-watermark" aria-hidden="true">v3</p>

	<div class="hp-masthead-main">
		<p class="hp-edition">
			<span class="hp-edition-mark" aria-hidden="true">▍</span>
			playground · plugins first · 2026
		</p>

		<h1 class="hp-wordmark">
			<span class="hp-wordmark-neo">neo</span><span class="hp-wordmark-slash">/</span><span
				class="hp-wordmark-drag">drag</span
			>
		</h1>

		<p class="hp-lede">
			<strong>Everything&rsquo;s a plugin</strong> — mostly built-ins, plus your own. One engine for
			Svelte, React, Vue, Solid, and vanilla.
		</p>

		{#if world_meta}
			<p class="hp-scene-line">
				<span class="hp-scene-label">scene</span>
				{world_meta.label}
				<span class="hp-scene-dot">·</span>
				{world_meta.tagline}
			</p>
		{/if}

		<div class="hp-actions">
			<a class="hp-cta hp-cta-primary unstyled" href="/docs/svelte">Getting started</a>
			<a
				class="hp-cta hp-cta-secondary unstyled"
				href="https://github.com/PuruVJ/neodrag"
				target="_blank"
				rel="external"
			>
				GitHub
			</a>
		</div>
	</div>

	{#if onworld}
		<div class="hp-scenarios-panel">
			<p class="hp-scenarios-label">
				<span aria-hidden="true">▍</span>
				scenarios
			</p>
			<ScenarioStrip active={world} onselect={onworld} />
		</div>
	{/if}
</header>
