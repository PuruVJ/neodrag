<script lang="ts">
	import { WORLDS, type WorldId } from './worlds';

	type Props = {
		active: WorldId;
		onselect: (id: WorldId) => void;
	};

	const { active, onselect }: Props = $props();
</script>

<nav class="scenes" aria-label="Playground scenarios">
	{#each WORLDS as world (world.id)}
		<button
			type="button"
			class:selected={active === world.id}
			class:locked={!world.available}
			disabled={!world.available}
			title={world.available ? world.tagline : 'Coming soon'}
			onclick={() => world.available && onselect(world.id)}
		>
			{world.label}
			{#if !world.available}
				<span class="soon">soon</span>
			{/if}
		</button>
	{/each}
</nav>

<style>
	.scenes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: flex-end;
	}

	button {
		padding: 0.45rem 0.9rem;
		border-radius: 0.5rem;
		font-family: var(--app-font-mono);
		font-size: 0.78rem;
		font-weight: 600;
		border: 0.2px solid transparent;
		color: color-mix(in lch, var(--app-color-dark), transparent 25%);
		background: color-mix(in lch, var(--app-color-dark), transparent 94%);

		&:hover:not(:disabled):not(.selected) {
			color: color-mix(in lch, var(--app-color-dark), transparent 8%);
			background: color-mix(in lch, var(--app-color-dark), transparent 88%);
			border-color: color-mix(in lch, var(--app-color-dark), transparent 82%);
		}

		&.selected {
			color: var(--app-color-primary-contrast);
			background: var(--app-color-primary);
			border-color: color-mix(in lch, var(--app-color-primary), var(--app-color-anti-mixer) 20%);
		}

		&.locked {
			opacity: 0.45;
			cursor: not-allowed;
		}
	}

	.soon {
		margin-left: 0.25rem;
		opacity: 0.75;
	}
</style>
