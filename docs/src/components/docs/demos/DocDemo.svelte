<script lang="ts">
	import type { Snippet } from 'svelte';

	// Shared chrome for an inline, interactive docs demo. The behaviour is framework-identical, so
	// docs demos are Svelte islands; the per-framework *code* lives in the <FrameworkSwitch> beside
	// them. Compose this from a concrete demo component and drop that into MDX with client:visible.
	let {
		label,
		hint,
		stage,
		controls,
		reset,
	}: { label?: string; hint?: string; stage: Snippet; controls?: Snippet; reset?: () => void } = $props();
</script>

<figure class="doc-demo">
	{#if controls}
		<div class="doc-demo-controls">{@render controls()}</div>
	{/if}
	<div class="doc-demo-stage">
		{@render stage()}
	</div>
	{#if label || reset}
		<figcaption class="doc-demo-cap">
			<span>{label}{#if hint}<span class="doc-demo-hint"> · {hint}</span>{/if}</span>
			{#if reset}
				<button type="button" class="doc-demo-reset" onclick={reset}>reset</button>
			{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.doc-demo {
		margin: 1.75rem 0;
		border: 1px solid var(--color-border-strong);
		border-radius: 14px;
		overflow: hidden;
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 3%);
	}
	.doc-demo-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.85rem;
		padding: 0.6rem 0.85rem;
		border-bottom: 1px solid var(--color-border);
		font: 500 0.74rem var(--app-font-mono);
		color: var(--color-fg-muted);
	}
	.doc-demo-controls :global(button) {
		padding: 0.22rem 0.62rem;
		font: inherit;
		color: var(--color-fg-muted);
		background: transparent;
		border: 1px solid var(--color-border-strong);
		border-radius: 999px;
		cursor: pointer;
	}
	.doc-demo-controls :global(button[aria-pressed='true']) {
		color: var(--app-color-shell);
		background: var(--color-brand);
		border-color: var(--color-brand);
	}
	.doc-demo-stage {
		position: relative;
		min-height: 13rem;
		display: grid;
		place-items: center;
		padding: 1.5rem;
		overflow: hidden;
	}
	.doc-demo-cap {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0.85rem;
		border-top: 1px solid var(--color-border);
		font: 500 0.72rem/1.4 var(--app-font-mono);
		color: var(--color-fg-muted);
	}
	.doc-demo-hint {
		color: color-mix(in lch, var(--color-fg-muted), transparent 25%);
	}
	.doc-demo-reset {
		flex-shrink: 0;
		padding: 0.2rem 0.6rem;
		font: inherit;
		color: var(--color-fg-muted);
		background: transparent;
		border: 1px solid var(--color-border-strong);
		border-radius: 999px;
		cursor: pointer;
	}
	.doc-demo-reset:hover {
		color: var(--color-fg);
		border-color: var(--color-brand);
	}
</style>
