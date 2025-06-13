<script lang="ts">
	import { wrapper } from '../../../../../../../svelte/src/index.svelte';
	import { DraggableFactory } from '../../../../../../src';
	import { transform } from '../../../../../../src/plugins';

	const { data } = $props();

	const factory = new DraggableFactory({
		plugins: [],
	});

	// @ts-ignore
	const draggable = wrapper(factory);

	const plugins = [transform(data.is_func ? func : undefined)];

	function func({
		offset,
		rootNode,
	}: Parameters<Exclude<Parameters<typeof transform>[0], undefined>>[0]) {
		if (rootNode instanceof SVGElement) {
			rootNode.setAttribute('transform', `translate(${offset.x} ${offset.y})`);
			rootNode.dataset.proofFuncWorked = '';
		} else {
			rootNode.style.left = `${offset.x}px`;
			rootNode.style.top = `${offset.y}px`;
		}
	}
</script>

{#if data.is_svg}
	<svg width="400" height="400" viewBox="0 0 400 400">
		<circle
			{@attach draggable(plugins)}
			cx="100"
			cy="100"
			r="50"
			fill="blue"
			opacity="0.5"
			data-testid="draggable"
		/>
	</svg>
{:else}
	<div
		class="box"
		style:position={data.is_func ? 'absolute' : null}
		{@attach draggable(plugins)}
		data-testid="draggable"
	></div>
{/if}

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}

	svg {
		border: 1px solid #ccc;
		background: white;
	}
</style>
