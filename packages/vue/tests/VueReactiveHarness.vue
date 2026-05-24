<script setup lang="ts">
	import { Draggable } from '@neodrag/vue';
	import { position, transform } from '@neodrag/vue/plugins';
	import { ref, watch } from 'vue';

	const props = defineProps<{ external: { x: number; y: number } }>();
	const pos = ref({ ...props.external });

	watch(
		() => props.external,
		(v) => {
			pos.value = { x: v.x, y: v.y };
		},
		{ deep: true },
	);

	const drag = new Draggable({
		plugins: [
			transform,
			() => position({ current: { x: pos.value.x, y: pos.value.y } }),
		],
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
