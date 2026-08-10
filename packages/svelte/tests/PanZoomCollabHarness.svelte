<script lang="ts">
	import { PanZoom } from '@neodrag/svelte/panzoom';
	import { MemoryBackend, Room } from '@neodrag/core/collab';

	// Two canvases sharing a paired in-memory room — a shared whiteboard. Panning A should move B.
	const [ba, bb] = MemoryBackend.pair('A', 'B');
	const roomA = new Room(ba);
	const roomB = new Room(bb);
	const a = new PanZoom({ id: 'board', room: roomA, minScale: 0.2, maxScale: 5 });
	const b = new PanZoom({ id: 'board', room: roomB, minScale: 0.2, maxScale: 5 });

	export const peerTransform = () => b.transform;
</script>

<div
	data-testid="a-vp"
	{...a.viewport}
	style="position: absolute; top: 0; left: 0; width: 300px; height: 200px;"
>
	<div {...a.world}><div style="width: 50px; height: 50px;"></div></div>
</div>

<div
	data-testid="b-vp"
	{...b.viewport}
	style="position: absolute; top: 260px; left: 0; width: 300px; height: 200px;"
>
	<div data-testid="b-world" {...b.world}><div style="width: 50px; height: 50px;"></div></div>
</div>
