<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import CheckIcon from '~icons/mdi/check';
	import ContentCopyIcon from '~icons/mdi/content-copy';
	import { FRAMEWORK_TABS } from './frameworks';
	import HighlightedCode from './HighlightedCode.svelte';
	import { get_snippet, LANG_BY_FRAMEWORK } from './snippet-templates';
	import type { WorldId } from './worlds';

	type Props = {
		world: WorldId;
		framework: Framework;
		onframework: (id: Framework) => void;
	};

	const { world, framework, onframework }: Props = $props();

	const snippet = $derived(get_snippet(world, framework));
	const lang = $derived(LANG_BY_FRAMEWORK[framework]);

	let copied = $state(false);
	let copy_timer: ReturnType<typeof setTimeout> | undefined;

	async function copy_snippet() {
		await navigator.clipboard.writeText(snippet);
		copied = true;
		clearTimeout(copy_timer);
		copy_timer = setTimeout(() => (copied = false), 1600);
	}

	const docs_href = $derived(
		FRAMEWORK_TABS.find((t) => t.id === framework)?.docsPath ?? '/docs/svelte',
	);
</script>

<aside class="code-panel" aria-label="Code for this scene">
	<header class="code-head">
		<span class="label h3">Source</span>
		<div class="head-actions">
			<button type="button" class="icon-btn" title="Copy snippet" onclick={copy_snippet}>
				{#if copied}
					<CheckIcon />
				{:else}
					<ContentCopyIcon />
				{/if}
			</button>
			<a class="docs-link unstyled" href={docs_href}>Docs</a>
		</div>
	</header>

	<div class="tabs" role="tablist" aria-label="Framework">
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

	<div class="code-body">
		{#key `${world}-${framework}`}
			<HighlightedCode code={snippet} {lang} />
		{/key}
	</div>
</aside>

<style>
	@import './playground-chrome.css';

	.code-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		padding: clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.5rem) clamp(1rem, 2.5vw, 1.5rem) 0;
	}

	.code-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.85rem;
	}

	.label {
		margin: 0;
	}

	.head-actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}

	.icon-btn {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		color: color-mix(in lch, var(--app-color-dark), transparent 20%);

		&:hover {
			background: color-mix(in lch, var(--app-color-dark), transparent 92%);
		}
	}

	.icon-btn :global(svg) {
		width: 1.15rem;
		height: 1.15rem;
	}

	.docs-link {
		padding: 0.4rem 0.9rem;
		border-radius: 0.5rem;
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--app-color-primary) !important;
		background-color: color-mix(in lch, var(--app-color-primary), transparent 92%) !important;
		background-image: none !important;
		border: 0.2px solid color-mix(in lch, var(--app-color-primary), transparent 60%);

		&:hover,
		&:focus-visible {
			color: var(--app-color-primary) !important;
			background-color: color-mix(in lch, var(--app-color-primary), transparent 84%) !important;
			border-radius: 0.5rem;
		}
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 1rem;
		padding-bottom: 0.85rem;
		border-bottom: 0.2px solid color-mix(in lch, var(--app-color-dark), transparent 85%);
	}

	.tabs button {
		padding: 0.4rem 0.85rem;
		border-radius: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		font-family: var(--app-font-mono);
		border: 0.2px solid transparent;
		color: color-mix(in lch, var(--app-color-dark), transparent 35%);
		background: transparent;

		&:hover:not(.selected) {
			color: color-mix(in lch, var(--app-color-dark), transparent 12%);
			background: color-mix(in lch, var(--app-color-dark), transparent 94%);
		}

		&.selected {
			background: color-mix(in lch, var(--app-color-dark), transparent 90%);
			color: color-mix(in lch, var(--app-color-dark), transparent 5%);
			border-color: color-mix(in lch, var(--app-color-dark), transparent 82%);
		}

		&[data-framework='svelte'].selected {
			color: var(--app-color-brand-svelte);
		}
		&[data-framework='react'].selected {
			color: var(--app-color-brand-react);
		}
		&[data-framework='vue'].selected {
			color: var(--app-color-brand-vue);
		}
		&[data-framework='solid'].selected {
			color: var(--app-color-brand-solid);
		}
		&[data-framework='vanilla'].selected {
			color: var(--app-color-brand-vanilla);
		}
	}

	.code-body {
		flex: 1;
		min-height: 14rem;
		overflow: auto;
		padding: 0.75rem 0.85rem;
		border-radius: 0.6rem;
		background-color: color-mix(in lch, var(--app-color-dark), transparent 94%);
	}
</style>
