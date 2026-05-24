<script lang="ts">
	import { Draggable } from '@neodrag/svelte';
	import { transform } from '@neodrag/svelte/plugins';

	const { tick = 0 }: { tick?: number } = $props();
	const drag = new Draggable({ plugins: [transform] });
	void tick;
</script>

<div class="box" {@attach drag.attachment} data-testid="draggable"></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background: cyan;
	}
</style>
