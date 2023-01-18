<script lang="ts">
	import { browser } from '$helpers/utils';
	import { theme } from '$stores/user-preferences.store';

	$: themeColor = (() => {
		$theme;

		if (!browser) return '';

		const value = getComputedStyle(document.body).getPropertyValue(
			'--app-color-scrolling-navbar'
		);

		return value?.trim();
	})();
</script>

<svelte:head>
	<meta name="theme-color" content={themeColor} />
</svelte:head>
