<script lang="ts">
	import { Draggable } from '../../src/index.ts';

	const { external = 0 }: { external?: number } = $props();

	const drag = new Draggable({ plugins: [] });

	void external;
</script>

<div class="box" {@attach drag.attachment} data-testid="draggable"></div>

<style>
	.box {
		width: 100px;
		height: 100px;
		background-color: cyan;
	}
</style>
