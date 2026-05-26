<script lang="ts">
	import { WORLDS, WORLD_COMPONENTS, type WorldId } from './worlds';

	type Props = {
		world: WorldId;
	};

	const { world }: Props = $props();

	const meta = $derived(WORLDS.find((w) => w.id === world)!);
	const Scene = $derived(WORLD_COMPONENTS[world]);
</script>

<section class="stage-wrap playground-surface" aria-label="Live demo">
	<div class="stage-inner">
		<Scene world={meta} />
	</div>
</section>

<style>
	@import './playground-chrome.css';

	.stage-wrap {
		flex: 1 1 auto;
		min-width: 0;
		min-height: 0;
		padding: 0.45rem;
		border-radius: 1.5rem;
		display: flex;
	}

	.stage-inner {
		flex: 1;
		min-height: 0;
		border-radius: 1.15rem;
		overflow: hidden;
	}
</style>
