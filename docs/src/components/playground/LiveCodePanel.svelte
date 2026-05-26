<script lang="ts">
	import { copy } from '$attachments/copy';
	import {
		framework_meta,
		PLAYGROUND_FRAMEWORKS,
		type FrameworkId,
	} from './frameworks';
	import { get_snippet } from './snippet-templates';
	import type { WorldId } from './worlds';
	import { WORLDS } from './worlds';

	type Props = {
		worldId: WorldId;
	};

	const { worldId }: Props = $props();

	let framework = $state<FrameworkId>('svelte');

	const meta = $derived(WORLDS.find((w) => w.id === worldId)!);
	const fw = $derived(framework_meta(framework));
	const snippet = $derived(get_snippet(worldId, framework));

	let copied = $state(false);
</script>

<aside class="code-panel">
	<header class="code-header">
		<div>
			<p class="world-name">{meta.label}</p>
			<p class="world-hint">{meta.hint}</p>
		</div>
	</header>

	<div class="framework-tabs" role="tablist" aria-label="Framework">
		{#each PLAYGROUND_FRAMEWORKS as fw_option}
			<button
				type="button"
				role="tab"
				class="fw-tab"
				class:active={framework === fw_option.id}
				aria-selected={framework === fw_option.id}
				data-framework={fw_option.id}
				onclick={() => (framework = fw_option.id)}
			>
				{fw_option.label}
			</button>
		{/each}
	</div>

	<p class="demo-note">Demo runs in Svelte — snippet matches your stack.</p>

	{#key `${worldId}-${framework}`}
		<pre class="snippet"><code>{snippet}</code></pre>
	{/key}

	<div class="actions">
		<button
			type="button"
			class="copy"
			class:copied
			{@attach copy({
				text: snippet,
				onCopy: () => {
					copied = true;
					setTimeout(() => (copied = false), 1500);
				},
			})}
		>
			{copied ? 'Copied' : 'Copy'}
		</button>
		<a class="docs-link" href={fw.docs}>Docs →</a>
	</div>
</aside>

<style>
	.code-panel {
		display: flex;
		flex-direction: column;
		min-height: 0;
		border-left: 1px solid color-mix(in lch, var(--app-color-dark), transparent 88%);
		background: color-mix(in lch, var(--app-color-shell), var(--app-color-dark) 2%);
	}

	.code-header {
		padding: 0.85rem 1rem 0.35rem;
		flex-shrink: 0;
	}

	.world-name {
		margin: 0;
		font-family: var(--app-font-heading);
		font-size: 1rem;
		font-weight: 600;
	}

	.world-hint {
		margin: 0.15rem 0 0;
		font-size: 0.75rem;
		opacity: 0.65;
	}

	.framework-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		padding: 0 0.75rem 0.5rem;
		flex-shrink: 0;
	}

	.fw-tab {
		padding: 0.25rem 0.5rem;
		border-radius: 0.4rem;
		font-size: 0.65rem;
		font-family: var(--app-font-mono);
		cursor: pointer;
		color: var(--app-color-dark);
		opacity: 0.7;
		transition:
			background 0.12s ease,
			opacity 0.12s ease;
	}

	.fw-tab:hover {
		opacity: 1;
		background: color-mix(in lch, var(--app-color-dark), transparent 92%);
	}

	.fw-tab.active[data-framework='svelte'] {
		background: color-mix(in lch, var(--app-color-brand-svelte), transparent 15%);
		color: var(--app-color-brand-svelte);
	}

	.fw-tab.active[data-framework='react'] {
		background: color-mix(in lch, var(--app-color-brand-react), transparent 15%);
		color: var(--app-color-brand-react);
	}

	.fw-tab.active[data-framework='vue'] {
		background: color-mix(in lch, var(--app-color-brand-vue), transparent 15%);
		color: var(--app-color-brand-vue);
	}

	.fw-tab.active[data-framework='solid'] {
		background: color-mix(in lch, var(--app-color-brand-solid), transparent 15%);
		color: var(--app-color-brand-solid);
	}

	.fw-tab.active[data-framework='vanilla'] {
		background: color-mix(in lch, var(--app-color-brand-vanilla), transparent 15%);
		color: var(--app-color-brand-vanilla);
	}

	.demo-note {
		margin: 0;
		padding: 0 1rem 0.35rem;
		font-size: 0.65rem;
		opacity: 0.55;
		flex-shrink: 0;
	}

	.snippet {
		flex: 1;
		margin: 0;
		padding: 0 1rem 0.75rem;
		overflow: auto;
		font-family: var(--app-font-mono);
		font-size: 0.68rem;
		line-height: 1.45;
		white-space: pre;
		color: var(--app-color-dark);
		min-height: 0;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		padding: 0.65rem 1rem 0.85rem;
		border-top: 1px solid color-mix(in lch, var(--app-color-dark), transparent 90%);
		flex-shrink: 0;
	}

	.copy {
		padding: 0.35rem 0.75rem;
		border-radius: 0.45rem;
		font-size: 0.8rem;
		background: color-mix(in lch, var(--app-color-primary), transparent 85%);
		color: var(--app-color-primary);
		cursor: pointer;
	}

	.copy.copied {
		background: color-mix(in lch, #28c840, transparent 80%);
		color: #1a6b2e;
	}

	.docs-link {
		padding: 0.35rem 0.75rem;
		font-size: 0.8rem;
		color: var(--app-color-primary);
		text-decoration: none;
		border-radius: 0.45rem;
	}

	.docs-link:hover {
		background: color-mix(in lch, var(--app-color-primary), transparent 92%);
	}
</style>
