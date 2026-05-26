<script lang="ts">
	import { browser } from '$helpers/utils';
	import { theme } from '$state/user-preferences.svelte';
	import LiveCodePanel from './LiveCodePanel.svelte';
	import PlaygroundIntro from './PlaygroundIntro.svelte';
	import PlaygroundStage from './PlaygroundStage.svelte';
	import ScenarioStrip from './ScenarioStrip.svelte';
	import { DEFAULT_FRAMEWORK } from './frameworks';
	import type { Framework } from '$helpers/constants';
	import {
		DEFAULT_WORLD,
		parse_world_from_hash,
		type WorldId,
	} from './worlds';

	theme.current;

	let world = $state<WorldId>(DEFAULT_WORLD);
	let framework = $state<Framework>(DEFAULT_FRAMEWORK);

	function sync_from_hash() {
		if (!browser) return;
		const from_hash = parse_world_from_hash(location.hash);
		if (from_hash) world = from_hash;
	}

	function select_world(id: WorldId) {
		world = id;
		if (browser) {
			history.replaceState(null, '', `#${id}`);
		}
	}

	$effect(() => {
		if (!browser) return;
		sync_from_hash();
		const on_hash = () => sync_from_hash();
		window.addEventListener('hashchange', on_hash);
		return () => window.removeEventListener('hashchange', on_hash);
	});
</script>

<div class="playground-home">
	<PlaygroundIntro {world} />

	<div class="workspace">
		<ScenarioStrip active={world} onselect={select_world} />
		<PlaygroundStage {world} />
		<LiveCodePanel {world} {framework} onframework={(id) => (framework = id)} />
	</div>
</div>

<style>
	.playground-home {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem 0 7rem;
		min-height: min(100dvh, 100%);
		box-sizing: border-box;
	}

	.workspace {
		display: grid;
		grid-template-columns: auto 1fr min(26rem, 38vw);
		gap: 0.75rem;
		flex: 1;
		min-height: clamp(18rem, 52vh, 34rem);
	}

	@media (max-width: 1100px) {
		.workspace {
			grid-template-columns: auto 1fr;
			grid-template-rows: 1fr auto;
		}

		.workspace :global(.code-panel) {
			grid-column: 1 / -1;
			max-height: 14rem;
		}
	}

	@media (max-width: 720px) {
		.workspace {
			grid-template-columns: 1fr;
		}

		.workspace :global(.strip) {
			flex-direction: row;
		}

		.workspace :global(.strip ul) {
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
		}

		.workspace :global(.strip button) {
			width: auto;
			flex-direction: row;
			padding: 0.45rem 0.7rem;
		}
	}
</style>
