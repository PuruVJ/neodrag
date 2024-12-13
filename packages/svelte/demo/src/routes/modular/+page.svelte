<script lang="ts">
	import { draggable } from '@neodrag/core';
</script>

<div use:draggable={{}} style="width: 100px; height: 100px; background: cyan">
	Hello

	<br />

	<div class="handle">Handle 1</div>
	<div class="handle">Handle 2</div>
</div>

<style>
	:global {
		body {
			margin: 0;
			height: 50vh;
		}
	}
</style>
