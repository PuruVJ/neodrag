<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createDraggable } from '../../../src';
	import type { Plugin } from '../../../src/plugins';

	const { draggable } = createDraggable();

	const { testid, children, plugins }: { plugins?: Plugin[]; testid: string; children?: Snippet } =
		$props();
</script>

<div class="box" use:draggable={plugins} data-testid={testid}>
	{@render children?.()}
</div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
