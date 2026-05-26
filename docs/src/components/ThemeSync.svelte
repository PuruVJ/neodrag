<script lang="ts">
	import { apply_theme_to_dom, init_theme_runtime, theme } from '$state/user-preferences.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		init_theme_runtime();
		apply_theme_to_dom(theme.current);

		return () => theme.stop_runtime();
	});

	$effect(() => {
		apply_theme_to_dom(theme.current);
	});
</script>
