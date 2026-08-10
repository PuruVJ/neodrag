<script lang="ts">
	import type { Snippet } from 'svelte';
	import PlaygroundIntro from './PlaygroundIntro.svelte';
	import ScenarioSection from './ScenarioSection.svelte';
	import { DEFAULT_FRAMEWORK } from './frameworks';
	import type { Framework } from '$helpers/constants';
	import { browser } from '$helpers/utils';
	import { WORLDS } from './worlds';

	type Props = {
		snippets?: Snippet;
	};

	const { snippets }: Props = $props();

	let framework = $state<Framework>(DEFAULT_FRAMEWORK);

	$effect(() => {
		if (!browser) return;
		document.body.dataset.framework = framework;
	});
</script>

<div class="home-playground">
	<div class="pg-backdrop" aria-hidden="true">
		<div class="pg-backdrop-grid"></div>
		<div class="pg-backdrop-glow"></div>
		<div class="pg-backdrop-vignette"></div>
	</div>

	<div class="pg-inner">
		<PlaygroundIntro />

		<div class="hp-scenarios-stack">
			{#each WORLDS as world, i (world.id)}
				{#if i > 0}
					<div class="hp-section-break" aria-hidden="true">
						<span class="hp-section-break-line"></span>
						<span class="hp-section-break-glyph">§</span>
						<span class="hp-section-break-line"></span>
					</div>
				{/if}

				<ScenarioSection
					{world}
					index={i}
					{framework}
					onframework={(id) => (framework = id)}
					{snippets}
				/>
			{/each}
		</div>

		<p class="hp-desk-footer" aria-hidden="true">
			<span class="hp-desk-footer-mark">▍</span>
			pointer-first · plugins at every phase · ships for every framework
		</p>
	</div>
</div>

<style>
	.home-playground {
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: min(84rem, 100%);
		min-height: calc(100dvh - 6rem);
		scroll-padding-top: 5.5rem;
		margin: 0 auto;
		padding: clamp(0.5rem, 1.5vw, 1rem) clamp(0.85rem, 3.5vw, 2.5rem) 8rem;
		box-sizing: border-box;
		font-family: 'Inter Variable', var(--app-font-main);
		color: var(--color-fg);
	}

	/* Base resets reach into the scenario/intro child components, so they're global. */
	.home-playground :global(:is(h1, h2, h3, h4, h5)) {
		width: auto;
		max-width: none;
		margin: 0;
		font-family: 'Inter Variable', var(--app-font-main);
		color: var(--color-fg);
	}

	.home-playground :global(button) {
		cursor: pointer;
	}

	.home-playground :global(a.unstyled) {
		color: inherit;
	}

	.pg-backdrop {
		pointer-events: none;
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		background-color: var(--app-color-shell);
	}

	.pg-backdrop-grid {
		position: absolute;
		inset: 0;
		background-color: color-mix(in lch, var(--app-color-shell), var(--color-brand) 1.25%);
		background-image:
			radial-gradient(circle at center, var(--color-grid-dot) 1px, transparent 1px),
			linear-gradient(var(--color-grid-major) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-grid-major) 1px, transparent 1px),
			linear-gradient(var(--color-grid-line) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
		background-size:
			var(--spacing-grid) var(--spacing-grid),
			calc(var(--spacing-grid) * 4) calc(var(--spacing-grid) * 4),
			calc(var(--spacing-grid) * 4) calc(var(--spacing-grid) * 4),
			var(--spacing-grid) var(--spacing-grid),
			var(--spacing-grid) var(--spacing-grid);
		background-position: center center;
		mask-image: radial-gradient(ellipse 120% 95% at 50% 42%, black 35%, transparent 88%);
	}

	.pg-backdrop-glow {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(
				ellipse 130% 95% at 50% -28%,
				color-mix(in lch, var(--color-brand), transparent 92%),
				transparent 68%
			),
			radial-gradient(
				ellipse 75% 55% at 100% 18%,
				color-mix(in lch, var(--color-brand), transparent 95%),
				transparent 58%
			),
			radial-gradient(
				ellipse 65% 50% at 0% 72%,
				color-mix(in lch, var(--color-brand), transparent 96%),
				transparent 55%
			),
			linear-gradient(
				165deg,
				color-mix(in lch, var(--color-brand), transparent 97%) 0%,
				transparent 38%,
				transparent 62%,
				color-mix(in lch, var(--color-fg), transparent 98%) 100%
			);
	}

	html[data-theme='dark'] .pg-backdrop-grid {
		background-color: color-mix(in lch, var(--app-color-shell), var(--color-brand) 2%);
		mask-image: radial-gradient(ellipse 115% 90% at 50% 40%, black 30%, transparent 85%);
	}

	html[data-theme='dark'] .pg-backdrop-glow {
		background-image:
			radial-gradient(
				ellipse 150% 110% at 50% -38%,
				color-mix(in lch, var(--color-brand), transparent 90%),
				transparent 58%
			),
			radial-gradient(
				ellipse 80% 60% at 100% 12%,
				color-mix(in lch, var(--color-brand), transparent 94%),
				transparent 48%
			),
			radial-gradient(
				ellipse 65% 50% at 0% 82%,
				color-mix(in lch, var(--color-brand), transparent 95%),
				transparent 45%
			),
			linear-gradient(180deg, transparent 55%, color-mix(in lch, var(--color-fg), transparent 98%) 100%);
	}

	.pg-backdrop-vignette {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(
				ellipse 85% 70% at 50% 50%,
				transparent 42%,
				color-mix(in lch, var(--app-color-shell), transparent 15%) 100%
			),
			linear-gradient(
				180deg,
				color-mix(in lch, var(--app-color-shell), transparent 8%) 0%,
				transparent 18%,
				transparent 82%,
				color-mix(in lch, var(--app-color-shell), transparent 12%) 100%
			);
	}

	html[data-theme='dark'] .pg-backdrop-vignette {
		background-image:
			radial-gradient(
				ellipse 90% 75% at 50% 48%,
				transparent 38%,
				color-mix(in lch, var(--app-color-shell), transparent 8%) 100%
			),
			linear-gradient(
				180deg,
				color-mix(in lch, var(--app-color-shell), transparent 25%) 0%,
				transparent 22%,
				transparent 78%,
				color-mix(in lch, var(--app-color-shell), transparent 35%) 100%
			);
	}

	.pg-inner {
		position: relative;
		z-index: 1;
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		gap: 0.25rem;
	}

	.hp-scenarios-stack {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.hp-section-break {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.35rem 0 0.65rem;
	}

	.hp-section-break-line {
		flex: 1;
		height: 1px;
		background: var(--color-border-strong);
	}

	.hp-section-break-glyph {
		font-family: var(--app-font-mono);
		font-size: 0.85rem;
		font-weight: 900;
		color: var(--color-fg-subtle);
		letter-spacing: 0.05em;
	}

	.hp-desk-footer {
		margin: 0.5rem 0 0;
		padding-top: 0.85rem;
		font-family: var(--app-font-mono);
		font-size: clamp(0.68rem, 1.3vw, 0.76rem);
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-fg-subtle);
		border-top: 1px solid var(--color-border);
	}

	.hp-desk-footer-mark {
		color: var(--color-brand);
		margin-right: 0.35rem;
	}

	/* Engine-driven sortable state on elements anywhere in the playground (some are portaled). */
	.home-playground :global([data-neodrag-sortable-dragging]) {
		z-index: 1;
		min-height: 2.35rem;
	}

	.home-playground :global([data-neodrag-sortable-elevated-source]) {
		position: relative;
		z-index: 10;
	}

	.home-playground :global([data-neodrag-sortable-indicator]) {
		color: var(--color-brand);
		border-radius: 2px;
	}

	.home-playground :global([data-neodrag-sortable-ghost]) {
		opacity: 0.4;
		border-style: dashed !important;
	}
</style>
