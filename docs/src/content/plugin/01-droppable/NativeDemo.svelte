<script lang="ts">
	import { Droppable } from '@neodrag/svelte/drop';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// `native: true` arms the OS drag-and-drop sensor: drag files or selected text from your
	// desktop/another app onto the zone and onDrop reports e.files / e.text.
	let status = $state('drag files or text from your OS onto the zone');

	const zone = new Droppable({
		native: true,
		onDrop: ({ files, text }) => {
			if (files && files.length) {
				status = `${files.length} file(s): ${files.map((f) => f.name).join(', ')}`;
			} else if (text) {
				status = `text: ${text}`;
			} else {
				status = 'dropped (no readable payload)';
			}
		},
	});

	function reset() {
		status = 'drag files or text from your OS onto the zone';
	}
</script>

<DocDemo
	label="native — drop OS files or text"
	hint="drag from your desktop or select-and-drag text from another app"
	{reset}
>
	{#snippet stage()}
		<div class="nv-zone" class:is-over={zone.isOver} {...zone.attach}>
			<span class="nv-icon" aria-hidden="true">⬇</span>
			<span class="nv-status">{status}</span>
		</div>
	{/snippet}
</DocDemo>

<style>
	.nv-zone {
		display: grid;
		place-items: center;
		gap: 0.6rem;
		width: 22rem;
		max-width: 100%;
		min-height: 8rem;
		padding: 1.25rem;
		text-align: center;
		color: var(--color-fg-muted);
		background: transparent;
		border: 2px dashed var(--color-border-strong);
		border-radius: 14px;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease,
			color 0.15s ease;
	}
	.nv-icon {
		font-size: 1.4rem;
		color: var(--color-brand);
	}
	.nv-status {
		font: 500 0.74rem/1.4 var(--app-font-mono);
		word-break: break-word;
	}
	.nv-zone.is-over {
		color: var(--color-fg);
		border-color: var(--color-brand);
		border-style: solid;
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 12%);
	}
</style>
