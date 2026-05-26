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
	class="playground-window window absolute w-[min(17rem,76%)] touch-none cursor-grab active:cursor-grabbing"
	style:--stack={stack}
	style:z-index={z}
	style:top="calc(16% + var(--stack) * 11%)"
	style:left="calc(14% + var(--stack) * 13%)"
	{@attach drag.attachment}
	onpointerdown={onactivate}
>
	<div class="playground-window-chrome">
		<span
			class="window-title font-mono text-[0.8rem] font-bold tracking-[0.06em] text-[color-mix(in_lch,var(--app-color-dark),transparent_10%)] uppercase"
		>
			{title}
		</span>
	</div>
	<div class="px-[1.1rem] pt-4 pb-[1.15rem]">
		<p class="m-0 text-[0.95rem] leading-[1.55] text-[color-mix(in_lch,var(--app-color-dark),transparent_22%)]">
			{body}
		</p>
	</div>
</article>
