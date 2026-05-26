<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import PanelWindow from './PanelWindow.svelte';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	const panels = [
		{ id: 'notes', title: 'Notes', body: 'Drag me anywhere on the desk.' },
		{ id: 'tasks', title: 'Tasks', body: 'Bounds keep windows inside the desk.' },
	];
</script>

<div class="desk">
	{#each panels as panel, i (panel.id)}
		<PanelWindow title={panel.title} body={panel.body} stack={i} />
	{/each}
</div>

<style>
	.desk {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100%;
		box-sizing: border-box;
	}
</style>
