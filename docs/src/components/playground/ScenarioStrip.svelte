<script lang="ts">
	import { WORLDS, type WorldId } from './worlds';

	type Props = {
		active: WorldId;
		onselect: (id: WorldId) => void;
	};

	const { active, onselect }: Props = $props();
</script>

<nav class="strip playground-surface" aria-label="Scenarios">
	<ul>
		{#each WORLDS as world (world.id)}
			<li>
				<button
					type="button"
					class:selected={active === world.id}
					class:locked={!world.available}
					disabled={!world.available}
					title={world.available ? world.tagline : `${world.label} — coming soon`}
					onclick={() => world.available && onselect(world.id)}
				>
					<span class="glyph" aria-hidden="true">{world.glyph}</span>
					<span class="label">{world.label}</span>
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	@import './playground-chrome.css';

	.strip {
		padding: 0.45rem;
		border-radius: 1.25rem;
		height: fit-content;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		width: 4.25rem;
		padding: 0.5rem 0.35rem;
		border-radius: 0.85rem;
		color: color-mix(in lch, var(--app-color-dark), transparent 15%);
		transition:
			background-color 150ms ease,
			transform 150ms ease;

		&:hover:not(:disabled) {
			background: color-mix(in lch, var(--app-color-shell), transparent 55%);
		}

		&.selected {
			background: color-mix(in lch, var(--app-color-primary), transparent 75%);
			color: var(--app-color-primary);
		}

		&.locked {
			opacity: 0.45;
			cursor: not-allowed;
		}
	}

	.glyph {
		font-size: 1.35rem;
		line-height: 1;
	}

	.label {
		font-size: 0.62rem;
		font-weight: 600;
		text-align: center;
		line-height: 1.2;
	}
</style>
