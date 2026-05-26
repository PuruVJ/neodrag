<script lang="ts">
	import { theme } from '$state/user-preferences.svelte';
	import { codeToHtml } from 'shiki';

	type Props = {
		code: string;
		lang: string;
	};

	const { code, lang }: Props = $props();

	let html = $state('');

	$effect(() => {
		const shiki_theme = theme.current === 'dark' ? 'github-dark' : 'github-light';

		let cancelled = false;

		codeToHtml(code, {
			lang,
			theme: shiki_theme,
		}).then((result) => {
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
		<pre class="fallback"><code>{code}</code></pre>
	{/if}
</div>

<style>
	.highlighted-code {
		margin: 0;
		overflow: auto;
		font-size: 0.78rem;
		line-height: 1.55;
	}

	.highlighted-code :global(pre) {
		margin: 0;
		padding: 0;
		background: transparent !important;
	}

	.highlighted-code :global(code) {
		font-family: var(--app-font-mono);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.fallback {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: inherit;
		white-space: pre-wrap;
	}
</style>
