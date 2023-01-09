<script lang="ts">
	import { draggable } from '@neodrag/svelte';
</script>

<div
	use:draggable={{
		handle: '.handle',
		transform: ({ offsetX, offsetY, rootNode }) => {
			rootNode.style.translate = `${offsetX}px ${offsetY}px 0`;
		},
	}}
>
	Hello

	<br />

	<div class="handle">Handle 1</div>
	<div class="handle">Handle 2</div>
</div>
