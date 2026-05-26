<script lang="ts">
	import type { Snippet } from 'svelte';
	import { browser } from '$helpers/utils';
	import { theme } from '$state/user-preferences.svelte';
	import LiveCodePanel from './LiveCodePanel.svelte';
	import PlaygroundIntro from './PlaygroundIntro.svelte';
	import PlaygroundStage from './PlaygroundStage.svelte';
	import { DEFAULT_FRAMEWORK } from './frameworks';
	import type { Framework } from '$helpers/constants';
	import {
		DEFAULT_WORLD,
		parse_world_from_hash,
		type WorldId,
	} from './worlds';

	type Props = {
		snippets?: Snippet;
	};

	const { snippets }: Props = $props();

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

<div class="home-playground">
	<PlaygroundIntro {world} onworld={select_world} />

	<section class="play-canvas" aria-label="Try dragging">
		<div class="stage-column">
			<p class="stage-hint">Drag the windows — they stay inside the desk.</p>
			<PlaygroundStage {world} />
		</div>

		<div class="playground-divider divider" aria-hidden="true"></div>

		<LiveCodePanel {world} {framework} onframework={(id) => (framework = id)} {snippets} />
	</section>
</div>

<style>
	@import './playground-chrome.css';

	.home-playground {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: min(1600px, 100%);
		margin: 0 auto;
		padding: clamp(0.75rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2.5rem) 8rem;
		box-sizing: border-box;
		min-height: calc(100dvh - 6rem);
	}

	.play-canvas {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 1px minmax(320px, 34vw);
		gap: 0;
		flex: 1;
		min-height: clamp(28rem, 62vh, 44rem);
	}

	.stage-column {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.stage-hint {
		margin: 0 0 0.75rem;
		font-family: var(--app-font-mono);
		font-size: clamp(0.8rem, 1.5vw, 0.95rem);
		color: color-mix(in lch, var(--app-color-dark), transparent 38%);
	}

	.divider {
		width: 1px;
		height: auto;
		align-self: stretch;
	}

	@media (max-width: 1100px) {
		.play-canvas {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
			min-height: clamp(24rem, 55vh, 36rem);
		}

		.divider {
			width: auto;
			height: 1px;
		}

		.home-playground :global(.code-panel) {
			min-height: 16rem;
		}
	}
</style>
