<script>
	import { Draggable } from '@neodrag/svelte';

	const drag_0 = new Draggable({ plugins: [] });
</script>

<div class="box" {@attach drag_0.attachment}>
	Helooo
	<button onclick={() => console.log(2)}> Button</button>
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: red;
	}
</style>
