<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { Droppable } from '@neodrag/svelte/drop';
	import DocDemo from '$components/docs/demos/DocDemo.svelte';

	// One chip, two bins. `accepts` gates each bin: only the files bin lights via isOver and
	// fires onDrop; the photos bin rejects the chip outright (no isOver, no onDrop).
	let pos = $state({ x: 0, y: 0 });
	let status = $state('drop the file chip into a bin');

	const chip = new Draggable({
		dragData: { kind: 'file', name: 'report.pdf' },
		get position() {
			return pos;
		},
		set position(v) {
			pos = v;
		},
	});

	const files = new Droppable({
		accepts: ({ data }) => (data as { kind?: string })?.kind === 'file',
		onDrop: ({ data }) => (status = `files bin accepted ${(data as { name: string }).name} ✓`),
	});

	const photos = new Droppable({
		accepts: ({ data }) => (data as { kind?: string })?.kind === 'photo',
		onDrop: () => (status = 'photos bin accepted a photo'),
	});

	function reset() {
		pos = { x: 0, y: 0 };
		status = 'drop the file chip into a bin';
	}
</script>

<DocDemo
	label="accepts — only the matching bin reacts"
	hint="the photos bin rejects a file: no highlight, no onDrop"
	{reset}
>
	{#snippet stage()}
		<div class="ac-row">
			<button class="ac-chip" {...chip.attach} aria-label="Draggable file chip">report.pdf</button>
			<div class="ac-bins">
				<div class="ac-bin" class:is-over={files.isOver} {...files.attach}>
					<span class="ac-bin-title">files</span>
					<span class="ac-bin-rule">accepts kind === 'file'</span>
				</div>
				<div class="ac-bin ac-bin-reject" class:is-over={photos.isOver} {...photos.attach}>
					<span class="ac-bin-title">photos</span>
					<span class="ac-bin-rule">rejects this chip</span>
				</div>
			</div>
		</div>
		<p class="ac-status">{status}</p>
	{/snippet}
</DocDemo>

<style>
	.ac-row {
		display: flex;
		align-items: center;
		gap: 2.5rem;
	}
	.ac-chip {
		display: grid;
		place-items: center;
		width: 5rem;
		height: 4rem;
		font: 700 0.74rem var(--app-font-mono);
		color: var(--app-color-shell);
		background: var(--color-brand);
		border: 0;
		border-radius: 12px;
		cursor: grab;
		touch-action: none;
		z-index: 2;
	}
	.ac-bins {
		display: flex;
		gap: 1.25rem;
	}
	.ac-bin {
		display: grid;
		place-items: center;
		gap: 0.35rem;
		width: 8rem;
		height: 6rem;
		padding: 0.5rem;
		text-align: center;
		color: var(--color-fg-muted);
		background: transparent;
		border: 2px dashed var(--color-border-strong);
		border-radius: 12px;
		transition:
			border-color 0.15s ease,
			background-color 0.15s ease,
			color 0.15s ease;
	}
	.ac-bin-title {
		font: 700 0.8rem var(--app-font-mono);
	}
	.ac-bin-rule {
		font: 500 0.66rem/1.3 var(--app-font-mono);
	}
	.ac-bin.is-over {
		color: var(--color-fg);
		border-color: var(--color-brand);
		border-style: solid;
		background: color-mix(in lch, var(--app-color-shell), var(--color-brand) 12%);
	}
	.ac-bin-reject {
		border-style: dotted;
		opacity: 0.7;
	}
	.ac-status {
		position: absolute;
		bottom: 0.75rem;
		margin: 0;
		font: 500 0.72rem var(--app-font-mono);
		color: var(--color-fg-muted);
	}
</style>
