<script lang="ts">
	import { axis, disabled, draggable, events } from '@neodrag/core';
	import { onMount } from 'svelte';

	let element = $state<HTMLElement>();

	onMount(() => {
		element?.addEventListener('neodrag_start', (event) => {
			console.log('Hua shurur');
		});
	});
</script>

<div
	use:draggable={{
		plugins: [
			events({
				onDrag(data) {
					console.log('Drag', data);
				},
			}),
		],
	}}
	bind:this={element}
	style="width: 100px; height: 100px; background: cyan"
>
	Hello

	<br />

	<div class="handle">Handle 1</div>
	<div class="handle">Handle 2</div>
</div>

<style>
	:global {
		body {
			margin: 0;
			height: 50vh;
		}
	}
</style>
