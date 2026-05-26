<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { bounds, BoundsFrom, events } from '@neodrag/svelte/plugins';

	type Props = {
		id: string;
		title: string;
		body: string;
		stack: number;
		z: number;
		onactivate: () => void;
	};

	const { title, body, stack, z, onactivate }: Props = $props();

	const drag = new Draggable({
		plugins: [
			bounds(BoundsFrom.parent()),
			events({
				onDragStart: () => onactivate(),
			}),
		],
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<article
	class="window playground-window"
	style:--stack={stack}
	style:z-index={z}
	{@attach drag.attachment}
	onpointerdown={onactivate}
>
	<div class="playground-window-chrome">
		<span class="window-title">{title}</span>
	</div>
	<div class="window-body">
		<p>{body}</p>
	</div>
</article>

<style>
	@import '../playground-chrome.css';

	.window {
		position: absolute;
		width: min(17rem, 76%);
		touch-action: none;
		cursor: grab;

		top: calc(16% + var(--stack) * 11%);
		left: calc(14% + var(--stack) * 13%);

		&:active {
			cursor: grabbing;
		}
	}

	.window-title {
		font-family: var(--app-font-mono);
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: color-mix(in lch, var(--app-color-dark), transparent 10%);
	}

	.window-body {
		padding: 1rem 1.1rem 1.15rem;
	}

	.window-body p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.55;
		color: color-mix(in lch, var(--app-color-dark), transparent 22%);
	}
</style>
