<script>
	import { theme } from '$state/user-preferences.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		// debugger;
	});
</script>

<div class="theme-switcher">
	<button class="theme-button light" onclick={() => (theme.preference = 'light')}>L</button>
	<button class="theme-button system" onclick={() => (theme.preference = 'system')}>S</button>
	<button class="theme-button dark" onclick={() => (theme.preference = 'dark')}>D</button>
</div>
