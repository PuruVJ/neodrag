<script setup lang="ts">
import { DragAxis, vDraggable } from '@neodrag/vue';
import HelloWorld from './components/HelloWorld.vue';

let unmounted = $ref(false);

let axis = $ref<DragAxis>('both');

function switchAxis() {
	if (axis === 'both') {
		axis = 'x';
	} else {
		axis = 'both';
	}
}
setTimeout(() => (unmounted = true), 3000);
</script>

<template>
	<HelloWorld v-if="!unmounted" />

	<div class="box" v-draggable>2nd</div>

	<br /><br />

	<button @click="switchAxis">Change axis</button>
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
