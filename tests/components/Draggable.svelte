<script lang="ts">
	import { DragBounds, draggable } from '../../src';

	export let body = 'Drag me!';
	export let axis: 'both' | 'x' | 'y' | 'none' = 'both';
	export let bounds: DragBounds | undefined = undefined;
	export let gpuAcceleration = true;
	export let disabled = false;
	export let grid: [number, number] | undefined = undefined;
</script>

<div id="drag-target" use:draggable={{ axis, bounds, gpuAcceleration, disabled, grid }}>{body}</div>
