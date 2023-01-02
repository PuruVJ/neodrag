<script lang="ts">
	import { draggable } from '@neodrag/svelte';
</script>

<div
	use:draggable={{
		handle: '.handle',
		onDragStart: ({ rootNode, currentNode }) => {
			console.log(rootNode, currentNode);
		},
	}}
>
	Hello

	<br />

	<div class="handle">Handle 1</div>
	<div class="handle">Handle 2</div>
</div>
