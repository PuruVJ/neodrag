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
	class="playground-window"
	style:--stack={stack}
	style:z-index={z}
	style:top="calc(16% + var(--stack) * 11%)"
	style:left="calc(14% + var(--stack) * 13%)"
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
