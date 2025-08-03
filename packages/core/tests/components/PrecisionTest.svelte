<script lang="ts">
	import { Compartment, draggable, events, position, threshold } from '../../../svelte/src/index.svelte.ts';

	type Props = {
		initialX?: number;
		initialY?: number;
	};

	const { initialX = 0, initialY = 30 }: Props = $props();

	let x = $state(initialX);
	let y = $state(initialY);

	const positionComp = Compartment.of(() => position({ current: { x, y } }));

	const dragAttachment = draggable(() => [
		positionComp,
		threshold({
			distance: 0,
			delay: 0,
		}),
		events({
			onDrag: (data) => {
				x = data.offset.x;
				y = data.offset.y;
			},
		}),
	]);
</script>

<div {@attach dragAttachment} class="drag" data-testid="draggable">
	<p class="drag">DRAG</p>
</div>
<div data-testid="position-display">position: {x} {y}</div>

<style>
	.drag {
		cursor: default;
		position: absolute;
		z-index: 1;
		background: white;
		width: 30px;
		height: 30px;
		border: 1px solid red;

		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
		}
	}

	p {
		margin: 0;
	}

	p.drag {
		font-weight: bold;
		color: red;
		font-size: 10px;
		text-align: center;
		line-height: 30px;
	}
</style>