<script>
	import { Draggable } from '@neodrag/svelte';
	import { bounds, BoundsFrom } from '@neodrag/svelte/plugins';

	const drag_0 = new Draggable({ plugins: [bounds(BoundsFrom.parent())] });
</script>

<div class="parent">
	<div class="box" {@attach drag_0.attachment}>Box</div>
</div>

<style>
	.parent {
		width: 90px;
	}

	.box {
		width: 200px;
		height: 200px;
	}

	:global {
		body {
			margin: 0;
			padding: 0;
			display: flex;
			justify-content: center;
			align-items: center;

			height: 100vh;
		}
	}
</style>
