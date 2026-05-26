<script lang="ts">
	import { WORLDS, WORLD_COMPONENTS, type WorldId } from './worlds';

	type Props = {
		world: WorldId;
	};

	const { world }: Props = $props();

	const meta = $derived(WORLDS.find((w) => w.id === world)!);
	const Scene = $derived(WORLD_COMPONENTS[world]);
</script>

<div class="playground-well">
	<Scene world={meta} />
</div>
