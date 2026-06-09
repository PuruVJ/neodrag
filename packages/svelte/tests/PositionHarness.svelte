<script lang="ts">
	import { Draggable, type DragEventData, type Point } from '@neodrag/svelte';

	let pos = $state<Point>({ x: 0, y: 0 });
	let dragCount = $state(0);

	const drag = new Draggable({
		// Two-way `position`: getter feeds the controlled offset in, setter syncs the live
		// offset back out. The wrapper writes the setter on every move — this must NOT loop.
		get position() {
			return pos;
		},
		set position(v: Point) {
			pos = v;
		},
		onDrag(_e: DragEventData) {
			dragCount += 1;
		},
	});

	export function getPos() {
		return pos;
	}

	export function getDragCount() {
		return dragCount;
	}
</script>

<div
	data-testid="draggable"
	data-dragging={drag.isDragging}
	data-x={pos.x}
	data-y={pos.y}
	style="position: absolute; top: 0; left: 0; width: 100px; height: 100px; background: teal;"
	{...drag.attach}
>
	drag me
</div>
