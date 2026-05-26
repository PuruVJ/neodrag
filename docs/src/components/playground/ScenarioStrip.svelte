<script lang="ts">
	import { WORLDS, type WorldId } from './worlds';

	type Props = {
		active: WorldId;
		onselect: (id: WorldId) => void;
	};

	const { active, onselect }: Props = $props();
</script>

<nav class="hp-scenarios" aria-label="Playground scenarios">
	{#each WORLDS as world, i (world.id)}
		<button
			type="button"
			class="hp-scenario-btn"
			class:is-selected={active === world.id}
			disabled={!world.available}
			title={world.available ? world.tagline : 'Coming soon'}
			onclick={() => world.available && onselect(world.id)}
		>
			<span class="hp-scenario-idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
			<span class="hp-scenario-label">{world.label}</span>
			{#if !world.available}
				<span class="hp-scenario-soon">soon</span>
			{/if}
		</button>
	{/each}
</nav>
