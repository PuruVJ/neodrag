<script lang="ts">
	import { Compartment, draggable, events, position } from '@neodrag/svelte';
	import type { Attachment } from 'svelte/attachments';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';

	const pos = new Tween({ x: 0, y: 0 }, { duration: 2000, easing: expoOut });

	const position_compartment = Compartment.of(() => position({ current: pos.current }));

	// $inspect(pos.current);

	export const x =
		(v: any): Attachment<HTMLElement> =>
		(element) => {
			$effect.pre(() => {
				console.log(v, element);
			});
		};
</script>

<!-- <span {@attach x([
		position({ current: $state.snapshot(pos.current) }),
		// position_compartment,
		events({
			onDragStart({ offset }) {
				pos.set({ x: offset.x, y: offset.y }, { duration: 0 });
			},
			onDrag: ({ offset }) => {
				pos.set({ x: offset.x, y: offset.y }, { duration: 0 });
			},
			onDragEnd: async () => {
				await pos.set({ x: 0, y: 0 }, { duration: 4000 });
			},
		}),
	])}></span> -->

<div
	{@attach draggable(() => [
		// position({ current: $state.snapshot(pos.current) }),
		position_compartment,
		events({
			onDragStart({ offset }) {
				pos.set({ x: offset.x, y: offset.y }, { duration: 0 });
			},
			onDrag: ({ offset }) => {
				pos.set({ x: offset.x, y: offset.y }, { duration: 0 });
			},
			onDragEnd: async () => {
				await pos.set({ x: 0, y: 0 }, { duration: 4000 });
			},
		}),
	])}
></div>

<!-- <div
	use:legacyDraggable={[
		position({ current: $state.snapshot(pos.current) }),
		// position_compartment,
		events({
			onDragStart({ offset }) {
				pos.set({ x: offset.x, y: offset.y }, { duration: 0 });
			},
			onDrag: ({ offset }) => {
				pos.set({ x: offset.x, y: offset.y }, { duration: 0 });
			},
			onDragEnd: async () => {
				await pos.set({ x: 0, y: 0 }, { duration: 4000 });
			},
		}),
	]}
></div> -->

<style>
	div {
		width: 100px;
		height: 100px;
		background-color: red;
	}
</style>
