<script lang="ts">
	import { ControlFrom, controls, draggable, events, position, threshold } from '@neodrag/core';

	let element = $state<HTMLElement>();

	let current_position = $state({ x: 0, y: 0 });

	const options = $derived([
		position({
			current: $state.snapshot(current_position),
			default: {
				x: 50,
				y: 65,
			},
		}),
		controls({
			allow: ControlFrom.element('.handle'),
		}),
		events(),
		threshold({
			// delay: 300,
		}),
	]);
</script>

<br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

<label>
	X
	<input type="range" bind:value={current_position.x} />
</label>

<label>
	Y
	<input type="range" bind:value={current_position.y} />
</label>

<div
	use:draggable={options}
	bind:this={element}
	style="width: 100px; height: 100px; background: cyan;"
>
	Hello

	<br />

	<div class="handle">Handle 1</div>
	<div class="handle">Handle 2</div>
</div>

<br />

<div class="container">
	<!-- {#each Array(100), i}
		<div use:draggable style="width: 100px; height: 100px; background: green;">{i}</div>
	{/each} -->
</div>

<style>
	:global {
		body {
			margin: 0;
			height: 50vh;
		}
	}

	.container {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		grid-gap: 10px;
	}
</style>
