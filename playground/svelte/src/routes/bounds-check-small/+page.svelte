<script>
	import { bounds, BoundsFrom, draggable } from '@neodrag/svelte';
</script>

<div class="parent">
	<div class="box" {@attach draggable([bounds(BoundsFrom.parent())])}>Box</div>
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
