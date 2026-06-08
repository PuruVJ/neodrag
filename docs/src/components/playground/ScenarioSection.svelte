<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Framework } from '$helpers/constants';
	import LiveCodePanel from './LiveCodePanel.svelte';
	import PlaygroundStage from './PlaygroundStage.svelte';
	import type { WorldMeta } from './worlds';

	type Props = {
		world: WorldMeta;
		index: number;
		framework: Framework;
		onframework: (id: Framework) => void;
		snippets?: Snippet;
	};

	const { world, index, framework, onframework, snippets }: Props = $props();

	const HINTS: Record<string, string> = {
		'night-desk': 'Stack floating panels — bounds keeps them on the desk.',
		'last-mile': 'Drag the van over city blocks — they light up green on enter.',
		'split-bill': 'Chips flow in a row (column when narrow) — siblings slide aside while you drag; drop commits the order.',
		'fridge-paws': 'Swap magnets — order commits when you release.',
		'laser-heist': 'Move cards across Plan, Sneak, Escape — onTransfer keeps state sane.',
	};

	const hint = $derived(HINTS[world.id] ?? 'Drag and explore — plugins handle the rest.');
</script>

<section
	id={world.id}
	class="hp-scenario-section"
	class:is-soon={!world.available}
	aria-labelledby="scenario-title-{world.id}"
>
	<header class="hp-section-head">
		<span class="hp-section-kicker">
			<span aria-hidden="true">▍</span>
			<span id="scenario-title-{world.id}">{world.label}</span>
		</span>
		<span class="hp-section-meta">
			{String(index + 1).padStart(2, '0')}
			<span class="hp-section-meta-dot" aria-hidden="true">·</span>
			{world.available ? 'live' : 'soon'}
		</span>
	</header>

	<p class="hp-section-hint">{hint}</p>

	<div class="hp-play-grid">
		<div class="hp-stage-col">
			<PlaygroundStage world={world.id} />
		</div>

		<div class="playground-divider" aria-hidden="true"></div>

		<LiveCodePanel world={world.id} {framework} {onframework} {snippets} />
	</div>
</section>
