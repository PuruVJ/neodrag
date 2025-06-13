<script lang="ts">
	import type { Popover } from 'melt/builders';

	type Props = {
		popover: Popover;
	};

	const { popover }: Props = $props();
</script>

<section {...popover.content}>Hello world</section>

<style>
	section {
		background-color: var(--background-color);
	}
</style>
