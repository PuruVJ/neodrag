<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import type { Snippet } from 'svelte';
	import CheckIcon from '~icons/mdi/check';
	import ContentCopyIcon from '~icons/mdi/content-copy';
	import { FRAMEWORK_TABS } from './frameworks';
	import { get_snippet } from './snippet-templates';
	import type { WorldId } from './worlds';

	type Props = {
		world: WorldId;
		framework: Framework;
		onframework: (id: Framework) => void;
		snippets?: Snippet;
	};

	const { world, framework, onframework, snippets }: Props = $props();

	const snippet_text = $derived(get_snippet(world, framework));
	const active_tab = $derived(FRAMEWORK_TABS.find((t) => t.id === framework));

	let copied = $state(false);
	let copy_timer: ReturnType<typeof setTimeout> | undefined;
	let snippets_host: HTMLDivElement | undefined;

	async function copy_snippet() {
		await navigator.clipboard.writeText(snippet_text);
		copied = true;
		clearTimeout(copy_timer);
		copy_timer = setTimeout(() => (copied = false), 1600);
	}

	const docs_href = $derived(active_tab?.docsPath ?? '/docs/svelte');

	function sync_visible_snippet() {
		if (!snippets_host) return;

		for (const block of snippets_host.querySelectorAll<HTMLElement>('.playground-snippet')) {
			const match =
				block.dataset.world === world && block.dataset.framework === framework;
			block.toggleAttribute('hidden', !match);
		}
	}

	$effect(() => {
		world;
		framework;
		sync_visible_snippet();
	});
</script>

<aside class="code-panel" aria-label="Code for this scene">
	<header class="code-head">
		<div class="terminal-prompt" aria-hidden="true">
			<span class="prompt-char">$</span>
			<span class="prompt-cmd">neodrag</span>
			<span class="prompt-flag">--adapter</span>
			<span class="prompt-value">{active_tab?.label ?? framework}</span>
		</div>
		<div class="head-actions">
			<button type="button" class="icon-btn" title="Copy snippet" onclick={copy_snippet}>
				{#if copied}
					<CheckIcon />
				{:else}
					<ContentCopyIcon />
				{/if}
			</button>
			<a class="docs-link unstyled" href={docs_href}>docs →</a>
		</div>
	</header>

	<div class="tabs" role="tablist" aria-label="Framework">
		<span class="tabs-label" aria-hidden="true">adapters ▸</span>
		{#each FRAMEWORK_TABS as tab (tab.id)}
			<button
				type="button"
				role="tab"
				aria-selected={framework === tab.id}
				class:selected={framework === tab.id}
				data-framework={tab.id}
				onclick={() => onframework(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="code-body" bind:this={snippets_host}>
		{#if snippets}
			{@render snippets()}
		{/if}
	</div>
</aside>

<style>
	@import './playground-chrome.css';

	.code-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		padding: 0 0 0 clamp(0.75rem, 2vw, 1.25rem);
	}

	.code-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem 1rem;
		margin-bottom: 0.75rem;
	}

	.terminal-prompt {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem 0.5rem;
		font-family: var(--app-font-mono);
		font-size: clamp(0.72rem, 1.3vw, 0.8125rem);
		color: var(--pg-muted, color-mix(in lch, var(--app-color-dark), transparent 35%));
	}

	.prompt-char {
		font-weight: 900;
		color: var(--pg-accent, var(--app-color-primary));
	}

	.prompt-cmd {
		font-weight: 600;
		color: var(--pg-fg, var(--app-color-dark));
	}

	.prompt-flag {
		opacity: 0.55;
	}

	.prompt-value {
		font-weight: 700;
		color: var(--pg-fg, var(--app-color-dark));
	}

	.head-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon-btn {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border: 0.2px solid var(--pg-border, color-mix(in lch, var(--app-color-dark), transparent 85%));
		color: var(--pg-muted, color-mix(in lch, var(--app-color-dark), transparent 25%));

		&:hover {
			border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 50%);
			color: var(--pg-accent, var(--app-color-primary));
			background: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 92%);
		}
	}

	.icon-btn :global(svg) {
		width: 1.05rem;
		height: 1.05rem;
	}

	.docs-link {
		padding: 0.35rem 0.75rem;
		font-family: var(--app-font-mono);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--pg-fg, var(--app-color-dark)) !important;
		background: transparent !important;
		background-image: none !important;
		border: 0.2px solid var(--pg-border-strong, color-mix(in lch, var(--app-color-dark), transparent 72%));

		&:hover,
		&:focus-visible {
			color: var(--pg-accent, var(--app-color-primary)) !important;
			border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 40%);
			background: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 92%) !important;
		}
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		padding-bottom: 0.65rem;
		border-bottom: 0.2px solid var(--pg-border, color-mix(in lch, var(--app-color-dark), transparent 85%));
	}

	.tabs-label {
		width: 100%;
		font-family: var(--app-font-mono);
		font-size: 0.6rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--pg-muted-soft, color-mix(in lch, var(--app-color-dark), transparent 55%));
	}

	.tabs button {
		padding: 0.3rem 0.65rem;
		font-family: var(--app-font-mono);
		font-size: 0.7rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		border: 0.2px solid var(--pg-border, color-mix(in lch, var(--app-color-dark), transparent 88%));
		color: var(--pg-muted, color-mix(in lch, var(--app-color-dark), transparent 32%));
		background: transparent;
		transition:
			border-color 75ms ease,
			color 75ms ease,
			background-color 75ms ease;

		&:hover:not(.selected) {
			color: var(--pg-accent, var(--app-color-primary));
			border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 55%);
			background: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 94%);
		}

		&.selected {
			color: var(--app-color-primary-contrast);
			background: var(--pg-accent, var(--app-color-primary));
			border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), black 12%);
		}

		&[data-framework='svelte'].selected:not(:hover) {
			color: var(--app-color-primary-contrast);
		}
	}

	.code-body {
		flex: 1;
		min-height: 14rem;
		overflow: auto;
		padding: 0.85rem 0.9rem;
		border: 0.2px solid var(--pg-border-strong, color-mix(in lch, var(--app-color-dark), transparent 78%));
		background: var(--pg-code-bg, color-mix(in lch, var(--app-color-dark), transparent 94%));
		box-shadow: inset 0 0 0 1px var(--pg-code-inset, transparent);
		font-size: clamp(0.75rem, 1.15vw, 0.875rem);
		line-height: 1.5;
	}

	.code-body:focus-within {
		border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 35%);
		box-shadow: 0 0 0 3px color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 88%);
	}
</style>
