<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Framework } from '$helpers/constants';
	import LiveCodePanel from './LiveCodePanel.svelte';
	import PlaygroundStage from './PlaygroundStage.svelte';
	import type { WorldMeta } from './worlds';

	type Props = {
		world: WorldMeta;
		index: number;
		framework: Framework;
		onframework: (id: Framework) => void;
		snippets?: Snippet;
	};

	const { world, index, framework, onframework, snippets }: Props = $props();

	const HINTS: Record<string, string> = {
		workshop: 'Drag the body, pull an edge or corner, or grab the dial to spin — all on one node.',
		'night-desk': 'Stack floating panels — bounds keeps them on the desk.',
		'last-mile': 'Drag the van over city blocks — they light up green on enter.',
		'split-bill': 'Chips flow in a row (column when narrow) — siblings slide aside while you drag; drop commits the order.',
		'fridge-paws': 'Swap magnets — order commits when you release.',
		'laser-heist': 'Move cards across Plan, Sneak, Escape — onTransfer keeps state sane.',
	};

	const hint = $derived(HINTS[world.id] ?? 'Drag and explore — plugins handle the rest.');
</script>

<section
	id={world.id}
	class="hp-scenario-section"
	class:is-soon={!world.available}
	aria-labelledby="scenario-title-{world.id}"
>
	<header class="hp-section-head">
		<span class="hp-section-kicker">
			<span aria-hidden="true">▍</span>
			<span id="scenario-title-{world.id}">{world.label}</span>
		</span>
		<span class="hp-section-meta">
			{String(index + 1).padStart(2, '0')}
			<span class="hp-section-meta-dot" aria-hidden="true">·</span>
			{world.available ? 'live' : 'soon'}
		</span>
	</header>

	<p class="hp-section-hint">{hint}</p>

	<div class="hp-play-grid">
		<div class="hp-stage-col">
			<PlaygroundStage world={world.id} />
		</div>

		<div class="playground-divider" aria-hidden="true"></div>

		<LiveCodePanel world={world.id} {framework} {onframework} {snippets} />
	</div>
</section>

<style>
	.hp-scenario-section {
		display: flex;
		flex-direction: column;
		gap: clamp(1.15rem, 2.8vw, 1.6rem);
		min-height: min(88vh, 52rem);
		padding: clamp(1.15rem, 3vw, 2rem);
		scroll-margin-top: 5.5rem;
		background: color-mix(in lch, var(--color-panel), transparent 6%);
		border: 2px solid var(--color-border);
		box-shadow:
			0 0 0 1px color-mix(in lch, var(--color-brand), transparent 82%),
			0 1px 0 color-mix(in lch, var(--color-tint), transparent 92%) inset,
			0 28px 56px -36px color-mix(in lch, var(--color-fg), transparent 84%);
		backdrop-filter: blur(14px) saturate(1.15);
	}

	html:not([data-theme='dark']) .hp-scenario-section {
		background: color-mix(in lch, var(--app-color-shell), transparent 14%);
		border-color: color-mix(in lch, var(--color-brand), transparent 78%);
		box-shadow:
			0 0 0 1px color-mix(in lch, var(--color-brand), transparent 70%),
			0 1px 0 color-mix(in lch, var(--color-tint), transparent 88%) inset,
			0 32px 64px -40px color-mix(in lch, var(--color-brand), transparent 82%),
			0 12px 32px -24px color-mix(in lch, var(--color-fg), transparent 90%);
	}

	.hp-scenario-section.is-soon .hp-play-grid {
		opacity: 0.88;
	}

	.hp-scenario-section.is-soon :global(.playground-well) {
		border-style: dashed;
	}

	.hp-scenario-section:target {
		border-color: color-mix(in lch, var(--color-brand), transparent 35%);
		box-shadow:
			0 0 0 1px color-mix(in lch, var(--color-brand), transparent 75%),
			0 24px 48px -28px color-mix(in lch, var(--color-brand), transparent 82%);
	}

	body.neodrag-ghost-active .hp-scenario-section {
		backdrop-filter: none;
	}

	.hp-section-meta-dot {
		opacity: 0.45;
	}

	.hp-section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--color-border-strong);
		font-family: var(--app-font-mono);
		font-size: clamp(0.68rem, 1.3vw, 0.76rem);
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.hp-section-kicker {
		display: inline-flex;
		align-items: baseline;
		gap: 0.35rem;
		color: var(--color-brand);
	}

	.hp-section-meta {
		color: var(--color-fg-subtle);
		font-weight: 600;
	}

	.hp-section-hint {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(0.8rem, 1.5vw, 0.9rem);
		font-weight: 600;
		color: var(--color-fg-muted);
	}

	.hp-play-grid {
		display: grid;
		flex: 1;
		grid-template-columns: minmax(0, 1fr) 2px minmax(300px, 38%);
		gap: 0;
		min-height: clamp(24rem, 54vh, 42rem);
	}

	.hp-stage-col {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		padding-right: clamp(0.85rem, 2.5vw, 1.5rem);
	}

	.playground-divider {
		background-color: var(--color-border-strong);
	}

	@media (max-width: 1100px) {
		.hp-play-grid {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
			min-height: clamp(24rem, 52vh, 36rem);
		}

		.hp-stage-col {
			padding-right: 0;
			padding-bottom: 0.85rem;
		}

		.hp-play-grid .playground-divider {
			width: auto;
			height: 2px;
		}
	}
</style>
