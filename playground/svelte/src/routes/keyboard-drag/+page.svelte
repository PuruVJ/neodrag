<script lang="ts">
	import { ariaDrag, keyboardDrag } from '@neodrag/core';
	import { Draggable } from '@neodrag/svelte';

	const drag = new Draggable({
		plugins: [
			keyboardDrag({ step: 12, fastStep: 36, speedupDelay: 600 }),
			ariaDrag({
				label: 'Keyboard draggable card',
				liveRegion: () => document.getElementById('keyboard-drag-live'),
			}),
		],
	});
</script>

<h1>Keyboard drag</h1>
<p>Focus the card, press <kbd>Space</kbd> to grab, arrows to move, <kbd>Space</kbd> or <kbd>Escape</kbd> to release.</p>

<div id="keyboard-drag-live" class="sr-only" aria-live="polite"></div>

<div class="stage">
	<div class="card" {@attach drag.attachment}>
		<strong>Drag me</strong>
		<p class="hint">Tab here, then Space + arrows</p>
	</div>
</div>

<style>
	.stage {
		position: relative;
		height: 320px;
		margin-top: 1rem;
		border: 1px dashed #64748b;
		border-radius: 8px;
		background: #0f172a;
	}

	.card {
		position: absolute;
		left: 40px;
		top: 40px;
		width: 160px;
		padding: 1rem;
		border-radius: 8px;
		background: #38bdf8;
		color: #0f172a;
		cursor: grab;
		outline-offset: 2px;
	}

	.card:focus-visible {
		outline: 2px solid #fbbf24;
	}

	.hint {
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
		opacity: 0.85;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
