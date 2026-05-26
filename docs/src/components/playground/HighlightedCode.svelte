<script lang="ts">
	import { theme } from '$state/user-preferences.svelte';
	import { highlight_playground_code } from './shiki';

	type Props = {
		code: string;
		lang: string;
	};

	const { code, lang }: Props = $props();

	let html = $state('');

	$effect(() => {
		theme.current;

		let cancelled = false;

		highlight_playground_code(code, lang).then((result) => {
			if (!cancelled) html = result;
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="highlighted-code">
	{#if html}
		{@html html}
	{:else}
		<pre class="fallback astro-code"><code>{code}</code></pre>
	{/if}
</div>

<style>
	.highlighted-code {
		margin: 0;
		overflow: auto;
		font-size: clamp(0.78rem, 1.2vw, 0.9rem);
		line-height: 1.5;
	}

	/* Match docs code blocks — dual theme via themes.css on .astro-code */
	.highlighted-code :global(pre.astro-code) {
		margin: 0;
		padding: 0;
		overflow-x: auto;
		font-size: inherit !important;
		line-height: inherit !important;
		background-color: transparent !important;
	}

	.highlighted-code :global(pre.astro-code code) {
		display: block;
		font-family: var(--app-font-mono);
		background-color: transparent;
		white-space: pre;
		word-break: normal;
	}

	.highlighted-code :global(.astro-code .line) {
		display: inline-block;
		width: 100%;
	}

	.fallback {
		margin: 0;
		padding: 0;
		font-family: var(--app-font-mono);
		font-size: inherit;
		white-space: pre;
		background: transparent;
	}
</style>
