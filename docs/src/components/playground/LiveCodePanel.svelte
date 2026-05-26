<script lang="ts">
	import { copy } from '$attachments/copy';
	import type { WorldId } from './worlds';
	import { WORLDS } from './worlds';
	import { get_snippet } from './snippet-templates';

	type Props = {
		worldId: WorldId;
	};

	const { worldId }: Props = $props();

	const meta = $derived(WORLDS.find((w) => w.id === worldId)!);
	const snippet = $derived(get_snippet(worldId));

	let copied = $state(false);
</script>

<aside class="code-panel">
	<header class="code-header">
		<div>
			<p class="world-name">{meta.label}</p>
			<p class="world-hint">{meta.hint}</p>
		</div>
		<span class="framework">Svelte</span>
	</header>

	<pre class="snippet"><code>{snippet}</code></pre>

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
		<a class="docs-link" href="/docs/svelte">Docs →</a>
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
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.85rem 1rem 0.5rem;
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

	.framework {
		font-size: 0.7rem;
		font-family: var(--app-font-mono);
		padding: 0.2rem 0.45rem;
		border-radius: 0.35rem;
		background: color-mix(in lch, var(--app-color-primary), transparent 90%);
		color: var(--app-color-primary);
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
