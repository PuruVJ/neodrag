<script lang="ts">
	import { onMount } from 'svelte';
	import LiveCodePanel from './LiveCodePanel.svelte';
	import PlaygroundStage from './PlaygroundStage.svelte';
	import ScenarioStrip from './ScenarioStrip.svelte';
	import { DEFAULT_WORLD, world_from_hash, type WorldId } from './worlds';

	let worldId = $state<WorldId>(DEFAULT_WORLD);

	function select_world(id: WorldId) {
		worldId = id;
		if (typeof location !== 'undefined') {
			history.replaceState(null, '', `#${id}`);
		}
	}

	onMount(() => {
		const from_hash = world_from_hash(location.hash);
		if (from_hash) worldId = from_hash;

		const on_hash = () => {
			const next = world_from_hash(location.hash);
			if (next) worldId = next;
		};
		window.addEventListener('hashchange', on_hash);
		return () => window.removeEventListener('hashchange', on_hash);
	});
</script>

<div id="playground-home" class="playground">
	<ScenarioStrip active={worldId} onselect={select_world} />
	<PlaygroundStage {worldId} />
	<LiveCodePanel {worldId} />
</div>

<style>
	.playground {
		display: grid;
		grid-template-columns: 4.75rem minmax(0, 1fr) min(20rem, 34vw);
		height: calc(100dvh - 5rem);
		width: 100%;
		max-width: 100vw;
		box-sizing: border-box;
		overflow: hidden;
	}

	@media (max-width: 900px) {
		.playground {
			grid-template-columns: 3.5rem minmax(0, 1fr);
			grid-template-rows: minmax(0, 1fr) auto;
		}

		.playground :global(.code-panel) {
			grid-column: 1 / -1;
			max-height: 38vh;
			border-left: none;
			border-top: 1px solid color-mix(in lch, var(--app-color-dark), transparent 88%);
		}
	}
</style>
