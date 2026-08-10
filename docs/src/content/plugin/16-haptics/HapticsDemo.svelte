<script lang="ts">
	import { Draggable, haptics } from '@neodrag/svelte';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `haptics` calls navigator.vibrate on drag start and end — a no-op on devices without the
	// Vibration API (most desktops). The badge mirrors *when* it fires so the effect is visible here;
	// on a supported phone you'll also feel it.
	let buzz = $state<'start' | 'end' | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;
	function flash(kind: 'start' | 'end') {
		buzz = kind;
		clearTimeout(timer);
		timer = setTimeout(() => (buzz = null), 320);
	}
	const drag = new Draggable({
		use: [haptics({ start: 12, end: [18, 30, 18] })],
		onDragStart: () => flash('start'),
		onDragEnd: () => flash('end'),
	});
</script>

<DocDemo label="Drag the box — haptics fires on grab and release" hint="vibrates on supported devices">
	{#snippet stage()}
		<div class="hp-stage">
			<button class="hp-box" {...drag.attach}>drag</button>
			<div class="hp-badge" class:on={buzz !== null}>
				{buzz === 'start' ? '📳 grab' : buzz === 'end' ? '📳 release' : 'idle'}
			</div>
		</div>
	{/snippet}
</DocDemo>

<style>
	.hp-stage {
		display: grid;
		place-items: center;
		gap: 1rem;
		width: 100%;
		height: 14rem;
	}
	.hp-box {
		display: grid;
		place-items: center;
		width: 5rem;
		height: 5rem;
		font: 700 0.82rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
	}
	.hp-box:active {
		cursor: grabbing;
	}
	.hp-badge {
		padding: 0.3rem 0.8rem;
		font: 600 0.76rem var(--app-font-mono);
		color: var(--color-fg-muted);
		background: color-mix(in lch, var(--app-color-shell), var(--color-fg) 6%);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		transition:
			color 0.12s ease,
			background 0.12s ease,
			border-color 0.12s ease,
			transform 0.12s ease;
	}
	.hp-badge.on {
		color: var(--app-color-shell);
		background: var(--color-brand);
		border-color: var(--color-brand);
		transform: scale(1.08);
	}
</style>
