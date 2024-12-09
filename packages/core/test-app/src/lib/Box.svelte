<script lang="ts">
	import type { Snippet } from 'svelte';
	import { draggable, type DragOptions } from '../../../src';

	const {
		testid,
		children,
		...draggble_options
	}: DragOptions & { testid: string; children?: Snippet } = $props();
</script>

<div class="box" use:draggable={draggble_options} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
