<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { WorldId } from './worlds';
	import { WORLD_COMPONENTS } from './worlds';

	type Props = {
		worldId: WorldId;
	};

	const { worldId }: Props = $props();

	const Scene = $derived(WORLD_COMPONENTS[worldId]);
</script>

<div class="stage">
	{#key worldId}
		<div class="scene" in:fade={{ duration: 200 }}>
			<Scene {worldId} />
		</div>
	{/key}
</div>

<style>
	.stage {
		position: relative;
		min-width: 0;
		min-height: 0;
		height: 100%;
		overflow: hidden;
	}

	.scene {
		height: 100%;
		min-height: 0;
	}
</style>
