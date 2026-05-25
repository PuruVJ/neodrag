<script setup lang="ts">
	import { Draggable } from '@neodrag/vue';
	import { position } from '@neodrag/vue/plugins';

	const props = defineProps<{ external: { x: number; y: number } }>();

	const drag = new Draggable({
		plugins: [() => position({ current: { x: props.external.x, y: props.external.y } })],
	});
</script>

<template>
	<div v-draggable="drag" data-testid="draggable" class="box" />
</template>

<style scoped>
	.box {
		width: 100px;
		height: 100px;
		background: cyan;
	}
</style>
