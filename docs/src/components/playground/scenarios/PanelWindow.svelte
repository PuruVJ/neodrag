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
	class="panel playground-dock-surface"
	style:--stack={stack}
	{@attach drag.attachment}
>
	<div class="grip" aria-hidden="true">
		<span></span><span></span><span></span><span></span><span></span><span></span>
	</div>
	<header class="panel-head">
		<h2>{title}</h2>
	</header>
	<p>{body}</p>
</article>

<style>
	@import '../playground-chrome.css';

	.panel {
		position: absolute;
		width: min(18rem, 78%);
		padding: 0;
		border-radius: 1.1rem;
		overflow: hidden;
		touch-action: none;
		cursor: grab;

		top: calc(14% + var(--stack) * 10%);
		left: calc(16% + var(--stack) * 12%);

		&:active {
			cursor: grabbing;
			box-shadow:
				inset 0 0 0 0.2px color-mix(in lch, var(--gray-1), transparent 30%),
				0 0 0 0.2px color-mix(in lch, var(--gray-9), transparent 30%),
				hsla(0, 0%, 0%, 0.35) 8px 24px 48px 8px;
		}
	}

	.grip {
		display: flex;
		justify-content: center;
		gap: 3px;
		padding: 0.45rem 0.5rem 0.15rem;
		opacity: 0.45;
	}

	.grip span {
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: color-mix(in lch, var(--app-color-dark), transparent 40%);
	}

	.panel-head {
		padding: 0.35rem 1.1rem 0.65rem;
	}

	.panel-head h2 {
		margin: 0;
		font-family: var(--app-font-heading);
		font-size: 1.15rem;
		font-weight: 600;
		color: color-mix(in lch, var(--app-color-dark), transparent 5%);
	}

	p {
		margin: 0;
		padding: 0 1.1rem 1.25rem;
		font-size: 0.95rem;
		line-height: 1.55;
		color: color-mix(in lch, var(--app-color-dark), transparent 22%);
	}
</style>
