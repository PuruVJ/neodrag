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
		min-height: 100%;
		padding: clamp(1.5rem, 4vw, 2.5rem);
		box-sizing: border-box;
		overflow: hidden;

		background-color: color-mix(in lch, var(--app-color-dark), transparent 92%);
		background-image:
			radial-gradient(
				ellipse 90% 70% at 20% 0%,
				color-mix(in lch, var(--app-color-primary), transparent 78%),
				transparent 60%
			),
			linear-gradient(
				color-mix(in lch, var(--app-color-dark), transparent 96%) 1px,
				transparent 1px
			),
			linear-gradient(
				90deg,
				color-mix(in lch, var(--app-color-dark), transparent 96%) 1px,
				transparent 1px
			);
		background-size:
			auto,
			28px 28px,
			28px 28px;
	}
</style>
