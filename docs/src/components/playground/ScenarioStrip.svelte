<script lang="ts">
	import type { WorldId } from './worlds';
	import { WORLDS } from './worlds';

	type Props = {
		active: WorldId;
		onselect: (id: WorldId) => void;
	};

	const { active, onselect }: Props = $props();
</script>

<nav class="strip" aria-label="Playground worlds">
	{#each WORLDS as world}
		<button
			type="button"
			class="world-btn"
			class:active={active === world.id}
			class:locked={!world.available}
			disabled={!world.available}
			title={world.available ? world.hint : `${world.label} — coming soon`}
			aria-current={active === world.id ? 'true' : undefined}
			onclick={() => world.available && onselect(world.id)}
		>
			<span class="glyph" aria-hidden="true">{world.glyph}</span>
			<span class="label">{world.label}</span>
		</button>
	{/each}
</nav>

<style>
	.strip {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.75rem 0.5rem;
		border-right: 1px solid color-mix(in lch, var(--app-color-dark), transparent 88%);
		background: color-mix(in lch, var(--app-color-shell), var(--app-color-dark) 3%);
		min-height: 0;
		overflow-y: auto;
	}

	.world-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem 0.35rem;
		border-radius: 0.65rem;
		cursor: pointer;
		transition:
			background 0.15s ease,
			opacity 0.15s ease;
		opacity: 0.85;
	}

	.world-btn:hover:not(:disabled) {
		background: color-mix(in lch, var(--app-color-primary), transparent 88%);
		opacity: 1;
	}

	.world-btn.active {
		background: color-mix(in lch, var(--app-color-primary), transparent 82%);
		opacity: 1;
	}

	.world-btn.locked {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.glyph {
		font-size: 1.35rem;
		line-height: 1;
	}

	.label {
		font-size: 0.6rem;
		text-align: center;
		line-height: 1.2;
		max-width: 4.5rem;
		color: var(--app-color-dark);
	}
</style>
