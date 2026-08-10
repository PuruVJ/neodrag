<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import PanelWindow from './PanelWindow.svelte';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	const panels = [
		{ id: 'notes', title: 'Notes', body: 'Bounds keeps this panel on the desk.' },
		{ id: 'tasks', title: 'Tasks', body: 'Stack windows — drag to bring forward.' },
	] as const;

	let z_counter = $state(2);
	let z_by_id = $state<Record<string, number>>({
		notes: 1,
		tasks: 2,
	});

	function bring_to_front(id: string) {
		z_counter += 1;
		z_by_id = { ...z_by_id, [id]: z_counter };
	}
</script>

<!-- `.desk` styling (positioning + radial glow) is the shared scene rule in PlaygroundStage. -->
<div class="desk">
	{#each panels as panel, i (panel.id)}
		<PanelWindow
			id={panel.id}
			title={panel.title}
			body={panel.body}
			stack={i}
			z={z_by_id[panel.id]}
			onactivate={() => bring_to_front(panel.id)}
		/>
	{/each}
</div>
