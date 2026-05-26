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

<div class="home-playground relative isolate flex min-h-[calc(100dvh-6rem)] w-full max-w-6xl flex-col px-3 pb-32 font-sans text-fg box-border sm:px-8" data-theme={active_theme}>
	<div class="pg-backdrop" aria-hidden="true"></div>

	<div class="relative z-[1] flex flex-col">
		<PlaygroundIntro {world} onworld={select_world} />

		<section
			class="play-canvas flex min-h-[clamp(28rem,62vh,44rem)] flex-1 flex-col gap-[var(--pg-section-gap,1.25rem)] border-[0.2px] border-[var(--pg-border)] bg-[var(--pg-panel)] p-4 sm:p-7"
			aria-label="Try dragging"
		>
			<header
				class="flex items-baseline justify-between gap-4 border-b-[0.2px] border-[var(--pg-border-strong)] pb-2.5 font-mono text-[clamp(0.62rem,1.2vw,0.7rem)] font-semibold tracking-[0.18em] uppercase"
			>
				<span class="inline-flex items-baseline gap-1.5 text-primary">
					<span aria-hidden="true">▍</span>
					try it
				</span>
				<span class="font-medium text-[var(--pg-muted-soft)]">drag · source</span>
			</header>

			<p class="m-0 font-mono text-[clamp(0.75rem,1.4vw,0.85rem)] text-[var(--pg-muted)]">
				Drag the windows — they stay inside the desk.
			</p>

			<div
				class="play-canvas-grid grid min-h-[clamp(22rem,52vh,40rem)] flex-1 grid-cols-1 max-[1100px]:grid-rows-[1fr_auto] min-[1101px]:grid-cols-[minmax(0,1fr)_1px_minmax(300px,36%)]"
			>
				<div class="stage-column flex min-h-0 min-w-0 flex-col max-[1100px]:pb-3 min-[1101px]:pr-5">
					<PlaygroundStage {world} />
				</div>

				<div class="playground-divider max-[1100px]:h-px min-[1101px]:w-px" aria-hidden="true"></div>

				<LiveCodePanel {world} {framework} onframework={(id) => (framework = id)} {snippets} />
			</div>
		</section>
	</div>
</div>
