<script setup lang="ts">
import { useDraggable } from '@neodrag/vue';
import { ref, watchEffect } from 'vue';

let el = ref<HTMLDivElement>();

const { isDragging, dragState } = $(useDraggable(el, { bounds: {} }));

watchEffect(() => {
	console.log({ isDragging, dragState: dragState });
});
</script>

<template>
	<div class="box" ref="el">Hello</div>
</template>

<style scoped>
:global(#app) {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

.box {
	height: 100%;
	width: 100%;
	background-color: cyan;
}
</style>
