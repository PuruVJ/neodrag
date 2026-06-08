<script setup lang="ts">
import { Draggable } from '../src/draggable.ts';
import { position } from '@neodrag/vue/plugins';
import { watch } from 'vue';

const props = defineProps<{ external: { x: number; y: number } }>();

const drag = new Draggable({
	plugins: [() => position({ current: { x: props.external.x, y: props.external.y } })],
});

watch(
	() => [props.external.x, props.external.y] as const,
	() => drag.flushReactive(),
);
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
