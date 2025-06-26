<script setup lang="ts">
import { events, position, useCompartment, vDraggable } from '@neodrag/vue';
import { ref, watchEffect } from 'vue';

const pos = ref({ x: 0, y: 0 });

const position_compartment = useCompartment(() =>
	position({ current: { x: pos.value.x, y: pos.value.y } }),
);

watchEffect(() => console.log(pos.value));
</script>

<template>
	<div
		class="box"
		v-draggable="
			() => [
				position_compartment,
				events({
					onDrag: ({ offset }) => {
						pos.x = offset.x;
						pos.y = offset.y;
					},
				}),
			]
		"
	></div>

	<br /><br />

	X:
	<input type="range" min="0" max="300" :value="pos.x" @input="(e) => (pos.x = +e.target.value)" />
	Y:
	<input type="range" min="0" max="300" :value="pos.y" @input="(e) => (pos.y = +e.target.value)" />
</template>

<style scoped>
.box {
	height: 100px;
	width: 100px;
	background-color: cyan;
}
</style>
