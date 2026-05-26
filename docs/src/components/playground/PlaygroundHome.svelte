<script lang="ts">
	import type { Snippet } from 'svelte';
	import PlaygroundIntro from './PlaygroundIntro.svelte';
	import ScenarioSection from './ScenarioSection.svelte';
	import { DEFAULT_FRAMEWORK } from './frameworks';
	import type { Framework } from '$helpers/constants';
	import { browser } from '$helpers/utils';
	import { WORLDS } from './worlds';

	type Props = {
		snippets?: Snippet;
	};

	const { snippets }: Props = $props();

	let framework = $state<Framework>(DEFAULT_FRAMEWORK);

	$effect(() => {
		if (!browser) return;
		document.body.dataset.framework = framework;
	});
</script>

<div class="home-playground">
	<div class="pg-backdrop" aria-hidden="true">
		<div class="pg-backdrop-grid"></div>
		<div class="pg-backdrop-glow"></div>
		<div class="pg-backdrop-vignette"></div>
	</div>

	<div class="pg-inner">
		<PlaygroundIntro />

		<div class="hp-scenarios-stack">
			{#each WORLDS as world, i (world.id)}
				{#if i > 0}
					<div class="hp-section-break" aria-hidden="true">
						<span class="hp-section-break-line"></span>
						<span class="hp-section-break-glyph">§</span>
						<span class="hp-section-break-line"></span>
					</div>
				{/if}

				<ScenarioSection
					{world}
					index={i}
					{framework}
					onframework={(id) => (framework = id)}
					{snippets}
				/>
			{/each}
		</div>

		<p class="hp-desk-footer" aria-hidden="true">
			<span class="hp-desk-footer-mark">▍</span>
			pointer-first · plugins at every phase · ships for every framework
		</p>
	</div>
</div>
