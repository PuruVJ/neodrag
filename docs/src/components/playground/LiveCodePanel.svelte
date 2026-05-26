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
				onclick={() => onframework(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="hp-code-body" bind:this={snippets_host}>
		{#if snippets}
			{@render snippets()}
		{/if}
	</div>
</aside>
