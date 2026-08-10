<script lang="ts">
	import { WORLDS, WORLD_COMPONENTS, type WorldId } from './worlds';

	type Props = {
		world: WorldId;
	};

	const { world }: Props = $props();

	const meta = $derived(WORLDS.find((w) => w.id === world)!);
	const Scene = $derived(WORLD_COMPONENTS[world]);
</script>

<div class="playground-well">
	<Scene world={meta} />
</div>

<style>
	.playground-well {
		flex: 1;
		min-height: min(100%, 24rem);
		position: relative;
		overflow: hidden;
		background-color: var(--color-well);
		background-image:
			linear-gradient(var(--color-grid-line) 1px, transparent 1px),
			linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
		background-size: var(--spacing-grid) var(--spacing-grid);
		border: 2px solid var(--color-border);
		border-radius: 0.5rem;
		box-shadow:
			inset 0 2px 0 var(--color-well-inset),
			inset 0 0 0 1px color-mix(in lch, var(--color-brand), transparent 88%);
	}

	.playground-well:has(:global([data-neodrag-sortable-dragging])) {
		overflow: visible;
	}

	html:not([data-theme='dark']) .playground-well {
		background-color: color-mix(in lch, var(--app-color-shell), var(--color-brand) 4%);
	}

	/* Scene roots + chrome are rendered by the scenario children, so they're global. */
	:global(.desk) {
		background:
			radial-gradient(
				circle at 20% 15%,
				color-mix(in lch, var(--color-brand), transparent 92%) 0%,
				transparent 45%
			),
			color-mix(in lch, var(--color-well), var(--color-fg) 4%);
	}

	:global(.desk),
	:global(.pg-scene) {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 100%;
		box-sizing: border-box;
	}

	:global(.pg-scene-kicker) {
		position: absolute;
		top: 0.65rem;
		left: 0.75rem;
		z-index: 1;
		margin: 0;
		padding: 0.2rem 0.45rem;
		font-family: var(--app-font-mono);
		font-size: 0.62rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
		pointer-events: none;
		border: 1px solid var(--color-border);
		border-radius: 0.2rem;
		background: color-mix(in lch, var(--app-color-shell), transparent 35%);
	}

	:global(.pg-drop-over) {
		border-color: var(--color-brand) !important;
		background: color-mix(in lch, var(--color-brand), transparent 86%) !important;
		box-shadow:
			inset 0 0 0 2px color-mix(in lch, var(--color-brand), transparent 55%),
			0 0 24px color-mix(in lch, var(--color-brand), transparent 70%);
	}

	:global(.pg-drop-over--success) {
		border-color: color-mix(in lch, #2ecc71, var(--color-border) 20%) !important;
		background: color-mix(in lch, #2ecc71, transparent 84%) !important;
		box-shadow:
			inset 0 0 0 2px color-mix(in lch, #2ecc71, transparent 45%),
			0 0 20px color-mix(in lch, #2ecc71, transparent 65%);
	}

	/* Shared layout for the four newer demos + their shared row style. */
	:global(.collab-scene),
	:global(.indicator-scene),
	:global(.resize-scene),
	:global(.extras-scene) {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 1rem;
	}

	:global(.collab-sub),
	:global(.indicator-sub),
	:global(.resize-sub),
	:global(.extras-sub) {
		margin: 0;
		max-width: 22rem;
		font-size: 0.78rem;
		font-weight: 600;
		text-align: center;
		color: color-mix(in lch, var(--color-fg), transparent 35%);
	}

	:global(.collab-row),
	:global(.indicator-row) {
		box-sizing: border-box;
		padding: 0.42rem 0.6rem;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--color-fg);
		background: var(--app-color-shell);
		border: 2px solid var(--color-border-strong);
		border-radius: 10px;
		cursor: grab;
		touch-action: none;
		user-select: none;
	}
</style>
