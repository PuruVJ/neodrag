<script lang="ts">
	import '@fontsource-variable/inter';
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

	const active_theme = $derived(theme.current);

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

<div class="home-playground" data-theme={active_theme}>
	<div class="pg-backdrop" aria-hidden="true"></div>

	<div class="pg-inner">
		<PlaygroundIntro {world} onworld={select_world} />

		<section class="pg-section play-canvas" aria-label="Try dragging">
			<header class="pg-section-head">
				<span class="pg-kicker"><span aria-hidden="true">▍</span> try it</span>
				<span class="pg-meta">drag · source</span>
			</header>

			<p class="pg-section-hint">Drag the windows — they stay inside the desk.</p>

			<div class="play-canvas-grid">
				<div class="stage-column">
					<PlaygroundStage {world} />
				</div>

				<div class="playground-divider divider" aria-hidden="true"></div>

				<LiveCodePanel {world} {framework} onframework={(id) => (framework = id)} {snippets} />
			</div>
		</section>
	</div>
</div>

<style>
	@import './playground-home.css';
	@import './playground-chrome.css';

	.home-playground {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: min(72rem, 100%);
		margin: 0 auto;
		padding: clamp(0.75rem, 2vw, 1.25rem) clamp(0.75rem, 3vw, 2rem) 8rem;
		box-sizing: border-box;
		min-height: calc(100dvh - 6rem);
	}

	.play-canvas {
		flex: 1;
		min-height: clamp(28rem, 62vh, 44rem);
	}

	.play-canvas-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 1px minmax(300px, 36%);
		gap: 0;
		flex: 1;
		min-height: clamp(22rem, 52vh, 40rem);
	}

	.stage-column {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
		padding-right: clamp(0.75rem, 2vw, 1.25rem);
	}

	.divider {
		width: 1px;
		height: auto;
		align-self: stretch;
	}

	@media (max-width: 1100px) {
		.play-canvas-grid {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
			min-height: clamp(22rem, 50vh, 34rem);
		}

		.stage-column {
			padding-right: 0;
			padding-bottom: 0.75rem;
		}

		.divider {
			width: auto;
			height: 1px;
		}

		.home-playground :global(.code-panel) {
			min-height: 16rem;
			padding-left: 0 !important;
			padding-top: 0.75rem !important;
		}
	}
</style>
