<script>
	import { draggable } from '@neodrag/svelte';
</script>

<div class="box" {@attach draggable()}>
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
