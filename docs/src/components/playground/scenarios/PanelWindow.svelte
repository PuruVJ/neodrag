<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { bounds, BoundsFrom } from '@neodrag/svelte/plugins';

	type Props = {
		title: string;
		body: string;
		stack: number;
	};

	const { title, body, stack }: Props = $props();

	const drag = new Draggable({
		plugins: [bounds(BoundsFrom.parent())],
	});
</script>

<article
	class="panel playground-surface"
	style:--stack={stack}
	{@attach drag.attachment}
>
	<header class="panel-head">
		<h2 class="h4">{title}</h2>
	</header>
	<p>{body}</p>
</article>

<style>
	@import '../playground-chrome.css';

	.panel {
		position: absolute;
		width: min(14rem, 72%);
		padding: 0;
		border-radius: 1.15rem;
		overflow: hidden;
		touch-action: none;
		cursor: grab;

		top: calc(18% + var(--stack) * 12%);
		left: calc(22% + var(--stack) * 14%);

		&:active {
			cursor: grabbing;
		}
	}

	.panel-head {
		padding: 0.65rem 0.9rem;
		border-bottom: 0.2px solid color-mix(in lch, var(--app-color-dark), transparent 82%);
	}

	.panel-head h2 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: color-mix(in lch, var(--app-color-dark), transparent 8%);
	}

	p {
		margin: 0;
		padding: 0.75rem 0.9rem 1rem;
		font-size: 0.88rem;
		line-height: 1.45;
		color: color-mix(in lch, var(--app-color-dark), transparent 25%);
	}
</style>
