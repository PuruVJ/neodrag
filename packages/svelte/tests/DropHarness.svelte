<script lang="ts">
	import { Droppable } from '@neodrag/svelte/drop';

	let dropped = $state(false);
	let names = $state<string[]>([]);
	let droppedText = $state('');
	let over = $state(false);

	const zone = new Droppable({
		native: true,
		onEnter: () => (over = true),
		onLeave: () => (over = false),
		onDrop: (e) => {
			dropped = true;
			over = false;
			names = (e.files ?? []).map((f) => f.name);
			droppedText = e.text ?? '';
		},
	});

	export function getDropped(): boolean {
		return dropped;
	}
	export function getFileNames(): string[] {
		return names;
	}
	export function getText(): string {
		return droppedText;
	}
	export function getOver(): boolean {
		return over;
	}
</script>

<div
	data-testid="zone"
	{...zone.attach}
	style="position: absolute; top: 100px; left: 100px; width: 200px; height: 150px; background: #eef; border: 2px dashed #88a;"
>
	drop files here
</div>
