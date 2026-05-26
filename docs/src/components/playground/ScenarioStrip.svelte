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
			<span class="name">{world.label}</span>
			{#if !world.available}
				<span class="soon">Soon</span>
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
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: color-mix(in lch, var(--app-color-dark), transparent 22%);
		background: color-mix(in lch, var(--app-color-dark), transparent 94%);
		transition:
			background-color 160ms ease,
			color 160ms ease,
			box-shadow 160ms ease;

		&:hover:not(:disabled) {
			color: color-mix(in lch, var(--app-color-dark), transparent 5%);
			background: color-mix(in lch, var(--app-color-dark), transparent 88%);
		}

		&.selected {
			color: var(--app-color-primary-contrast);
			background: var(--app-color-primary);
			box-shadow: 0 4px 18px color-mix(in lch, var(--app-color-primary), transparent 50%);
		}

		&.locked {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.soon {
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.7;
	}
</style>
