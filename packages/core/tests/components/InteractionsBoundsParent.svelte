<script lang="ts">
	import { bounds, BoundsFrom } from '../../src/interactions/index.ts';
	import InteractionsBox from './InteractionsBox.svelte';
</script>

<div class="parent" data-testid="parent">
	<InteractionsBox plugins={[bounds(BoundsFrom.parent())]} />
</div>

<style>
	.parent {
		position: relative;
		width: 200px;
		height: 200px;
		overflow: hidden;
	}
</style>
