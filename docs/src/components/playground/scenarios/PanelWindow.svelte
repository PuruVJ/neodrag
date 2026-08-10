<script lang="ts">
	import { Draggable } from '@neodrag/svelte';

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
		bounds: 'parent',
		onDragStart: () => onactivate(),
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<article
	class="absolute w-[min(17rem,76%)] cursor-grab touch-none overflow-hidden rounded-lg border-2 border-border-strong bg-shell shadow-lg active:cursor-grabbing"
	style:--stack={stack}
	style:z-index={z}
	style:top="calc(16% + var(--stack) * 11%)"
	style:left="calc(14% + var(--stack) * 13%)"
	{...drag.attach}
	onpointerdown={onactivate}
>
	<div class="border-b-2 border-border bg-panel-strong px-4 py-2.5">
		<span class="font-mono text-sm font-extrabold tracking-wider uppercase text-fg">{title}</span>
	</div>
	<div class="px-5 pt-4 pb-5">
		<p class="m-0 text-base leading-relaxed font-medium text-fg-muted">{body}</p>
	</div>
</article>
