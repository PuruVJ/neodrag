<script>
	const { children } = $props();
</script>

{@render children()}

<style>
	:global {
		:root {
			color-scheme: light dark;
		}
	}
</style>
