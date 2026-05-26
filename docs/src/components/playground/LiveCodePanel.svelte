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

<aside class="code-panel playground-surface" aria-label="Code for this scene">
	<div class="toolbar">
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

		<div class="toolbar-actions">
			<button type="button" class="icon-btn" title="Copy snippet" onclick={copy_snippet}>
				{#if copied}
					<CheckIcon />
				{:else}
					<ContentCopyIcon />
				{/if}
			</button>
			<a class="docs-link" href={docs_href}>Docs</a>
		</div>
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
		border-radius: 1.5rem;
		overflow: hidden;
	}

	.toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.45rem 0.55rem;
		border-bottom: 0.2px solid color-mix(in lch, var(--app-color-dark), transparent 80%);
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
	}

	.tabs button {
		padding: 0.35rem 0.65rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		color: color-mix(in lch, var(--app-color-dark), transparent 30%);
		transition: background-color 150ms ease;

		&.selected {
			color: var(--app-color-primary);
			background: color-mix(in lch, var(--app-color-primary), transparent 82%);
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

	.toolbar-actions {
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.icon-btn {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		color: color-mix(in lch, var(--app-color-dark), transparent 25%);

		:global(svg) {
			width: 1.1rem;
			height: 1.1rem;
		}
	}

	.docs-link {
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		text-decoration: none;
		color: var(--app-color-primary-contrast);
		background: var(--app-color-primary);
	}

	.code-body {
		flex: 1;
		min-height: 0;
		overflow: auto;
		padding: 0.85rem 1rem 1.1rem;
	}
</style>
