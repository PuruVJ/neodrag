<script lang="ts">
	import { Draggable, type DragEventData } from '@neodrag/svelte';

	// Reactive options driven imperatively from the test via the exported setters below.
	let axis = $state<'x' | 'y' | 'both'>('both');
	let disabled = $state(false);
	let dragCount = $state(0);

	const drag = new Draggable({
		get axis() {
			return axis;
		},
		get disabled() {
			return disabled;
		},
		onDrag(_e: DragEventData) {
			dragCount += 1;
		},
	});

	export function setAxis(next: 'x' | 'y' | 'both') {
		axis = next;
	}

	export function setDisabled(next: boolean) {
		disabled = next;
	}

	export function getDragCount() {
		return dragCount;
	}

	export function getIsDragging() {
		return drag.isDragging;
	}
</script>

<div
	data-testid="draggable"
	data-dragging={drag.isDragging}
	data-axis={axis}
	style="position: absolute; top: 0; left: 0; width: 100px; height: 100px; background: rebeccapurple;"
	{...drag.attach}
>
	drag me
</div>
