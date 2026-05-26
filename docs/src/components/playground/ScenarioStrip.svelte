<script lang="ts">
	import { WORLDS, type WorldId } from './worlds';

	type Props = {
		active: WorldId;
		onselect: (id: WorldId) => void;
	};

	const { active, onselect }: Props = $props();
</script>

<nav class="scenes" aria-label="Playground scenarios">
	{#each WORLDS as world, i (world.id)}
		<button
			type="button"
			class:selected={active === world.id}
			class:locked={!world.available}
			disabled={!world.available}
			title={world.available ? world.tagline : 'Coming soon'}
			onclick={() => world.available && onselect(world.id)}
		>
			<span class="idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
			<span class="label">{world.label}</span>
			{#if !world.available}
				<span class="soon">soon</span>
			{/if}
		</button>
	{/each}
</nav>

<style>
	.scenes {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	button {
		display: grid;
		grid-template-columns: 2.25rem 1fr auto;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.5rem 0.55rem;
		text-align: left;
		font-family: var(--app-font-mono);
		font-size: 0.78rem;
		border: 0.2px solid transparent;
		color: var(--pg-muted, color-mix(in lch, var(--app-color-dark), transparent 30%));
		background: transparent;
		transition:
			background-color 75ms ease,
			border-color 75ms ease,
			color 75ms ease,
			padding-left 75ms ease;

		&:hover:not(:disabled):not(.selected) {
			color: var(--pg-fg, var(--app-color-dark));
			background: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), transparent 94%);
			padding-left: 0.75rem;
		}

		&.selected {
			color: var(--app-color-primary-contrast);
			background: var(--pg-accent, var(--app-color-primary));
			border-color: color-mix(in lch, var(--pg-accent, var(--app-color-primary)), black 15%);
		}

		&.selected .idx {
			color: color-mix(in lch, var(--app-color-primary-contrast), transparent 25%);
		}

		&.locked {
			opacity: 0.42;
			cursor: not-allowed;
		}
	}

	.idx {
		font-weight: 900;
		font-variant-numeric: tabular-nums;
		color: var(--pg-muted-soft, color-mix(in lch, var(--app-color-dark), transparent 55%));
	}

	.label {
		font-weight: 700;
	}

	.soon {
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.8;
	}
</style>
