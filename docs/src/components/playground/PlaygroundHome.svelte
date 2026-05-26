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
	<div class="pg-backdrop" aria-hidden="true"></div>

	<div class="pg-inner">
		<PlaygroundIntro {world} onworld={select_world} />

		<section class="hp-play-section" aria-label="Try dragging">
			<header class="hp-section-head">
				<span class="hp-section-kicker"><span aria-hidden="true">▍</span> try it</span>
				<span class="hp-section-meta">drag · source</span>
			</header>

			<p class="hp-section-hint">Drag the windows — they stay inside the desk.</p>

			<div class="hp-play-grid">
				<div class="hp-stage-col">
					<PlaygroundStage {world} />
				</div>

				<div class="playground-divider" aria-hidden="true"></div>

				<LiveCodePanel {world} {framework} onframework={(id) => (framework = id)} {snippets} />
			</div>
		</section>
	</div>
</div>
