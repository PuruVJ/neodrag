<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import type { Snippet } from 'svelte';
	import type { Action } from 'svelte/action';
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
			const match = block.dataset.world === world && block.dataset.framework === framework;
			block.toggleAttribute('hidden', !match);
		}
	}

	const bind_code_host: Action<HTMLDivElement, { world: WorldId; framework: Framework }> = (
		node,
		params,
	) => {
		snippets_host = node;
		sync_visible_snippet();

		return {
			update(next) {
				if (!next || (next.world === params?.world && next.framework === params?.framework)) {
					return;
				}
				params = next;
				sync_visible_snippet();
			},
			destroy() {
				snippets_host = undefined;
			},
		};
	};
</script>

<aside class="hp-code-panel" aria-label="Code for this scene">
	<header class="hp-code-head">
		<div class="hp-terminal" aria-hidden="true">
			<span class="hp-terminal-char">$</span>
			<span class="hp-terminal-cmd">neodrag</span>
			<span class="hp-terminal-flag">--adapter</span>
			<span class="hp-terminal-value">{active_tab?.label ?? framework}</span>
		</div>
		<div class="hp-code-actions">
			<button type="button" class="hp-icon-btn" title="Copy snippet" onclick={copy_snippet}>
				{#if copied}
					<CheckIcon />
				{:else}
					<ContentCopyIcon />
				{/if}
			</button>
			<a class="hp-docs-link unstyled" href={docs_href}>docs →</a>
		</div>
	</header>

	<div class="hp-tabs" role="tablist" aria-label="Framework">
		<span class="hp-tabs-label" aria-hidden="true">adapters ▸</span>
		{#each FRAMEWORK_TABS as tab (tab.id)}
			<button
				type="button"
				role="tab"
				aria-selected={framework === tab.id}
				class="hp-tab"
				class:is-selected={framework === tab.id}
				data-framework={tab.id}
				onclick={() => {
					onframework(tab.id);
					queueMicrotask(sync_visible_snippet);
				}}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="hp-code-body docs-prose" use:bind_code_host={{ world, framework }}>
		{#if snippets}
			{@render snippets()}
		{/if}
	</div>
</aside>

<style>
	.hp-code-panel {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		padding-left: clamp(0.85rem, 2.5vw, 1.5rem);
	}

	.hp-code-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.65rem 1rem;
		margin-bottom: 0.85rem;
	}

	.hp-terminal {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem 0.55rem;
		font-family: var(--app-font-mono);
		font-size: clamp(0.78rem, 1.4vw, 0.9rem);
		color: var(--color-fg-muted);
	}

	.hp-terminal-char {
		font-weight: 900;
		font-size: 1.05em;
		color: var(--color-brand);
	}

	.hp-terminal-cmd {
		font-weight: 800;
		color: var(--color-fg);
	}

	.hp-terminal-flag {
		opacity: 0.5;
		font-weight: 600;
	}

	.hp-terminal-value {
		font-weight: 800;
		color: var(--color-fg);
	}

	.hp-code-actions {
		display: flex;
		align-items: center;
		gap: 0.55rem;
	}

	.hp-icon-btn {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border: 2px solid var(--color-border);
		color: var(--color-fg-muted);
	}

	.hp-icon-btn:hover {
		border-color: var(--color-brand);
		color: var(--color-brand);
		background: color-mix(in lch, var(--color-brand), transparent 88%);
	}

	.hp-icon-btn :global(svg) {
		width: 1.1rem;
		height: 1.1rem;
	}

	.hp-docs-link {
		padding: 0.45rem 0.85rem;
		font-family: var(--app-font-mono);
		font-size: 0.74rem;
		font-weight: 900;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-fg) !important;
		background: transparent !important;
		background-image: none !important;
		border: 2px solid var(--color-border-strong);
	}

	.hp-docs-link:hover,
	.hp-docs-link:focus-visible {
		color: var(--color-brand) !important;
		border-color: var(--color-brand);
		background: color-mix(in lch, var(--color-brand), transparent 88%) !important;
	}

	.hp-tabs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin-bottom: 0.85rem;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--color-border);
	}

	.hp-tabs-label {
		width: 100%;
		font-family: var(--app-font-mono);
		font-size: 0.64rem;
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-brand);
	}

	.hp-tab {
		padding: 0.38rem 0.75rem;
		font-family: var(--app-font-mono);
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		border: 2px solid var(--color-border);
		color: var(--color-fg-muted);
		background: transparent;
		transition:
			border-color 75ms ease,
			color 75ms ease,
			background-color 75ms ease;
	}

	.hp-tab:hover:not(.is-selected) {
		color: var(--color-brand);
		border-color: color-mix(in lch, var(--color-brand), transparent 45%);
		background: color-mix(in lch, var(--color-brand), transparent 90%);
	}

	.hp-tab.is-selected {
		color: var(--app-color-primary-contrast);
		background: var(--color-brand);
		border-color: color-mix(in lch, var(--color-brand), black 15%);
	}

	.hp-code-body {
		flex: 1;
		min-height: 15rem;
		overflow: auto;
	}

	.hp-code-body:focus-within :global(:where(pre.astro-code)) {
		box-shadow:
			inset 0 0 0 1px color-mix(in lch, var(--app-color-dark), transparent 90%),
			0 0 0 3px color-mix(in lch, var(--color-brand), transparent 78%);
	}

	/* Snippet blocks are rendered into the code body via the `snippets` snippet, so they're global. */
	:global(.playground-snippet[hidden]) {
		display: none !important;
	}

	:global(.playground-snippet:not([hidden])) {
		display: block;
	}

	:global(.playground-snippet :where(pre.astro-code)) {
		overflow-x: auto;
	}

	:global(.playground-snippet :where(pre.astro-code code)) {
		display: block;
		white-space: pre-wrap;
		word-break: break-word;
	}

	:global(.playground-snippet :where(.astro-code .line)) {
		display: inline-block;
		width: 100%;
	}

	@media (max-width: 1100px) {
		.hp-code-panel {
			min-height: 17rem;
			padding-left: 0;
			padding-top: 0.85rem;
		}
	}
</style>
