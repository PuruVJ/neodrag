<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import PanelWindow from './PanelWindow.svelte';

	type Props = {
		world: WorldMeta;
	};

	const { world: _world }: Props = $props();

	const panels = [
		{ id: 'notes', title: 'Notes', body: 'Drag me anywhere on the desk.' },
		{ id: 'tasks', title: 'Tasks', body: 'Bounds keep panels inside the stage.' },
	];
</script>

<div class="night-desk">
	{#each panels as panel, i (panel.id)}
		<PanelWindow title={panel.title} body={panel.body} stack={i} />
	{/each}
</div>

<style>
	.night-desk {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 16rem;
		padding: 1.25rem;
		border-radius: 1.25rem;
		overflow: hidden;

		background:
			radial-gradient(
				120% 80% at 12% 0%,
				color-mix(in lch, var(--app-color-primary), transparent 88%),
				transparent 55%
			),
			color-mix(in lch, var(--app-color-shell), var(--app-color-primary) 4%);
		box-shadow: inset 0 0 0 0.2px color-mix(in lch, var(--gray-9), transparent 85%);
	}
</style>
