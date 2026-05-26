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
	<p class="watermark" aria-hidden="true">v3</p>

	<div class="masthead-main">
		<p class="edition">
			<span class="mark" aria-hidden="true">▍</span>
			playground · plugins first · 2026
		</p>

		<h1 class="wordmark">
			<span class="neo">neo</span><span class="slash">/</span><span class="drag">drag</span>
		</h1>

		<p class="lede">
			<strong>Everything&rsquo;s a plugin</strong> — mostly built-ins, plus your own. One engine for
			Svelte, React, Vue, Solid, and vanilla.
		</p>

		{#if world_meta}
			<p class="scene-line">
				<span class="scene-label">scene</span>
				{world_meta.label}
				<span class="scene-dot">·</span>
				{world_meta.tagline}
			</p>
		{/if}

		<div class="actions">
			<a class="cta primary unstyled" href="/docs/svelte">Getting started</a>
			<a
				class="cta secondary unstyled"
				href="https://github.com/PuruVJ/neodrag"
				target="_blank"
				rel="external"
			>
				GitHub
			</a>
		</div>
	</div>

	{#if onworld}
		<div class="masthead-scenes">
			<p class="scenes-label">
				<span aria-hidden="true">▍</span>
				scenarios
			</p>
			<ScenarioStrip active={world} onselect={onworld} />
		</div>
	{/if}
</header>

<style>
	.masthead {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		gap: clamp(1.5rem, 4vw, 2.5rem);
		padding: clamp(0.25rem, 2vw, 1rem) 0 clamp(1.25rem, 3vw, 2rem);
		overflow: hidden;
	}

	.watermark {
		position: absolute;
		top: -0.15em;
		right: -0.05em;
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(5rem, 18vw, 9rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.06em;
		color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 92%);
		pointer-events: none;
		user-select: none;
	}

	.masthead-main {
		position: relative;
		display: grid;
		gap: 0.65rem;
		max-width: 40rem;
	}

	.edition {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: var(--pg-kicker-size, 0.68rem);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--pg-muted, color-mix(in lch, var(--app-color-dark), transparent 40%));
	}

	.edition .mark {
		color: var(--pg-accent, var(--app-color-primary));
	}

	.wordmark {
		margin: 0;
		font-size: clamp(2.75rem, 11vw, 5.5rem);
		font-weight: 800;
		line-height: 0.92;
		letter-spacing: -0.045em;
		width: max-content;
		max-width: 100%;
		background: none;
		-webkit-text-fill-color: unset;
	}

	.neo {
		font-style: italic;
		font-weight: 600;
	}

	.slash {
		color: var(--pg-accent, var(--app-color-primary));
		font-style: normal;
		font-weight: 800;
		padding: 0 0.02em;
	}

	.drag {
		font-weight: 800;
		border-bottom: 4px solid var(--pg-accent, var(--app-color-primary));
		padding-bottom: 0.02em;
	}

	.lede {
		margin: 0.35rem 0 0;
		font-size: clamp(1rem, 2vw, 1.0625rem);
		line-height: 1.55;
		max-width: 36rem;
		color: var(--pg-muted, color-mix(in lch, var(--app-color-dark), transparent 28%));
	}

	.lede strong {
		color: var(--pg-fg, var(--app-color-dark));
		font-weight: 700;
	}

	.scene-line {
		margin: 0.15rem 0 0;
		font-family: var(--app-font-mono);
		font-size: 0.8rem;
		color: var(--pg-muted-soft, color-mix(in lch, var(--app-color-dark), transparent 38%));
	}

	.scene-label {
		color: var(--pg-accent, var(--app-color-primary));
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin-right: 0.35rem;
	}

	.scene-dot {
		opacity: 0.5;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		margin-top: 0.75rem;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.65rem 1.15rem;
		font-family: var(--app-font-mono);
		font-size: 0.78rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		transition:
			background-color 80ms ease,
			border-color 80ms ease,
			color 80ms ease,
			letter-spacing 80ms ease;
	}

	.cta.primary {
		color: var(--app-color-primary-contrast) !important;
		background: var(--pg-accent, var(--app-color-primary)) !important;
		background-image: none !important;
		border: 0.2px solid color-mix(in lch, var(--pg-accent, var(--app-color-primary)), black 12%);

		&:hover,
		&:focus-visible {
			color: var(--app-color-primary-contrast) !important;
			letter-spacing: 0.1em;
			background: color-mix(
				in lch,
				var(--pg-accent, var(--app-color-primary)),
				var(--app-color-anti-mixer) 12%
			) !important;
		}
	}

	.cta.secondary {
		color: var(--pg-fg, var(--app-color-dark)) !important;
		background: transparent !important;
		background-image: none !important;
		border: 0.2px solid var(--pg-border-strong, color-mix(in lch, var(--app-color-dark), transparent 72%));

		&:hover,
		&:focus-visible {
			color: var(--pg-accent, var(--app-color-primary)) !important;
			border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 35%);
			background: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 92%) !important;
		}
	}

	.masthead-scenes {
		display: grid;
		gap: 0.65rem;
		padding: clamp(0.85rem, 2vw, 1.1rem);
		background: var(--pg-panel, color-mix(in lch, var(--app-color-anti-mixer), transparent 97.5%));
		border: 0.2px solid var(--pg-border, color-mix(in lch, var(--app-color-dark), transparent 85%));
	}

	.scenes-label {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: var(--pg-kicker-size, 0.68rem);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--pg-accent, var(--app-color-primary));
	}

	@media (min-width: 900px) {
		.masthead {
			grid-template-columns: 1fr minmax(14rem, 22rem);
			align-items: start;
		}

		.masthead-scenes {
			margin-top: 2.5rem;
		}
	}
</style>
