<script lang="ts">
	import { browser } from '$helpers/utils';
	import { theme } from '$state/user-preferences.svelte.ts';

	let theme_color = $derived.by(() => {
		theme.current;

		if (!browser) return '';

		const value = getComputedStyle(document.body).getPropertyValue(
			'--app-color-scrolling-navbar',
		);

		return value?.trim();
	});
</script>

<svelte:head>
	<meta name="theme-color" content={theme_color} />
</svelte:head>
