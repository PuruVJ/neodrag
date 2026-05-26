<script lang="ts">
	import type { WorldId } from '../worlds';
	import { WORLDS } from '../worlds';

	type Props = {
		worldId: WorldId;
	};

	const { worldId }: Props = $props();

	const meta = $derived(WORLDS.find((w) => w.id === worldId)!);
</script>

<div class="coming-soon">
	<span class="glyph">{meta.glyph}</span>
	<p class="title">{meta.label}</p>
	<p class="hint">This world is next in the queue.</p>
	<p class="sub">Try <strong>Night desk</strong> — drag and resize the windows.</p>
</div>

<style>
	.coming-soon {
		display: grid;
		place-content: center;
		place-items: center;
		height: 100%;
		text-align: center;
		gap: 0.5rem;
		padding: 2rem;
		color: rgb(255 255 255 / 0.85);
	}

	.glyph {
		font-size: 3rem;
		line-height: 1;
		opacity: 0.9;
	}

	.title {
		margin: 0;
		font-family: var(--app-font-heading);
		font-size: clamp(1.5rem, 4vw, 2rem);
	}

	.hint,
	.sub {
		margin: 0;
		font-size: 0.95rem;
		opacity: 0.75;
		max-width: 28ch;
	}

	.sub strong {
		color: #fff;
		font-weight: 600;
	}
</style>
