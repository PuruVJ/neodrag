<script setup lang="ts">
import { ControlFrom, controls, events, grid, vDraggable } from '@neodrag/vue';
import { ref } from 'vue';
import HelloWorld from './components/HelloWorld.vue';

let unmounted = ref(false);
// let axis = ref<'x' | 'y' | null>(null);

let cancel1 = ref<HTMLDivElement>();
let cancel2 = ref<HTMLDivElement>();

// function switchAxis() {
// 	if (axis.value === 'y') {
// 		axis.value = 'x';
// 	} else {
// 		axis.value = 'both';
// 	}
// }

setTimeout(() => (unmounted.value = true), 3000);

function onDrag(e: { offset: { x: number; y: number } }) {
	console.log(e);
}
</script>

<template>
	<HelloWorld v-if="!unmounted" />

	<div
		class="box"
		v-draggable="[
			events({ onDrag }),
			grid([10, 10]),
			controls({ block: ControlFrom.elements([cancel1, cancel2]) }),
		]"
	>
		2nd
		<br /><br />
		<div class="cancel" ref="cancel1">Cancel me out</div>
		<div class="cancel" ref="cancel2">Cancel me out pt 2</div>
	</div>

	<br /><br />

	<!-- <button @click="switchAxis">Change axis</button> -->
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
