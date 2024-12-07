<script>
	import { browser } from '$helpers/utils';
	import { theme } from '$state/user-preferences.svelte.ts';

	$effect(() => {
		if (browser) {
			globalThis.document.body.classList.remove('light', 'dark');
			globalThis.document.body.classList.add(theme.current);
		}
	});
</script>
