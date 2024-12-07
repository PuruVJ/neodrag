<script lang="ts">
	import squircle from '$/worklet/squircle.js?url';
	import { typingEffect } from '$actions/typingEffect';
	import { browser } from '$helpers/utils';
	import { draggable } from '@neodrag/svelte';
	import { onMount } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import PawIcon from '~icons/mdi/paw';

	let heading_text = 'Try dragging the box below';

	let box_wiggles = $state(true);

	let show_custom_cursor = true;

	let coords_cursor = $state({
		x: 0,
		y: 0,
	});

	let drag_position = new Tween(
		{ x: 0, y: 0 },
		{ easing: expoOut, duration: 1200 },
	);

	function handle_mouse_move(e: MouseEvent) {
		coords_cursor ??= { x: 0, y: 0 };

		coords_cursor.x = e.clientX;
		coords_cursor.y = e.clientY;
	}

	onMount(() => {
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}
	});
</script>

<svelte:window onmousemove={handle_mouse_move} />

<div class="container">
	{#key heading_text}
		<p class="h3" class:hidden={false} use:typingEffect={60}>
			{browser ? heading_text : ''}
		</p>
	{/key}

	<div
		class="box"
		class:wiggles={box_wiggles}
		use:draggable={{
			bounds: 'parent',
			position: drag_position.current,
			onDragStart: () => {
				box_wiggles = false;
			},
			onDrag: ({ offsetX, offsetY }) =>
				drag_position.set({ x: offsetX, y: offsetY }, { duration: 0 }),
			onDragEnd: () => {
				drag_position.target = { x: 0, y: 0 };
			},
		}}
	>
		<div class="paw">
			<PawIcon />
		</div>
	</div>

	<div
		class="cursor"
		style:transform="translate3d(calc({coords_cursor?.x ?? 0}px - 50%), calc({coords_cursor?.y ??
			0}px - 50%), 0)"
		style:--opacity={show_custom_cursor && coords_cursor ? 1 : 0}
	>
		<PawIcon style="font-size: 2rem;" />
	</div>
</div>

<style lang="scss">
	@import '../../css/breakpoints';

	.container {
		position: relative;

		width: auto;
		height: 100%;

		background-color: hsla(var(--app-color-dark-hsl), 0.1);

		border-radius: 1rem;
		box-shadow: var(--inner-shadow-4);

		display: grid;
		place-items: center;
		place-content: center;
		gap: 2rem;

		@include media('<desktop') {
			height: 80vh;
		}

		&,
		& * {
			cursor: none;
		}

		@media (hover: hover) {
			&:hover {
				.cursor {
					display: block;
				}
			}
		}
	}

	p {
		position: absolute;
		top: 25%;

		font-family: var(--app-font-mono);
		color: hsla(var(--app-color-dark-hsl), 0.6);
		word-spacing: 4px;
		font-size: clamp(1rem, 2vw, 2.5rem);

		max-width: fit-content;

		opacity: 1;

		&:empty {
			content: ' ';
		}

		&.hidden {
			opacity: 0;
		}
	}

	.box {
		--size: clamp(4rem, 20vw, 12rem);

		position: relative;

		display: grid;
		place-content: center;

		text-align: center;

		width: var(--size, 8rem);
		height: var(--size, 8rem);

		z-index: 0;

		padding: 1rem;

		background-image: var(--app-color-primary-gradient);

		border-radius: 1rem;
		box-shadow:
			0px 12.5px 10px rgba(0, 0, 0, 0.035),
			0px 100px 80px rgba(0, 0, 0, 0.07);

		mask-image: paint(squircle);
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		font-size: 1rem;
		color: var(--app-color-primary-contrast);

		cursor: none;

		&.wiggles {
			animation: shake 1.5s 1;
			animation-delay: 2s;
		}

		&:hover {
			.paw {
				opacity: 1;
				transform: scale(1);
			}

			& ~ .cursor {
				display: none;
			}
		}
	}

	.cursor,
	.paw {
		filter: drop-shadow(0px 4px 4px #00000059);
	}

	.cursor {
		position: fixed;
		top: 0;
		left: 0;

		display: none;

		opacity: var(--opacity);

		pointer-events: none;

		z-index: 2;

		:global(svg path) {
			fill: var(--app-color-dark);
		}
	}

	.paw {
		width: var(--size);
		height: var(--size);

		opacity: 0;

		transform: scale(0.6);

		transition: 0.1s ease-in-out;
		transition-property: opacity, transform;

		:global(svg) {
			position: absolute;
			right: calc(0.03 * var(--size));
			bottom: calc(0.03 * var(--size));

			// width: 61%;
			min-width: clamp(
				calc(0.61 * 4rem),
				calc(0.61 * 20vw),
				calc(0.61 * 12rem)
			);
			// height: auto;
		}

		:global(svg path) {
			fill: #201b1b !important;
		}
	}

	@keyframes shake {
		10%,
		90% {
			transform: translate(-4px);
		}
		20%,
		80% {
			transform: translate(8px);
		}
		30%,
		50%,
		70% {
			transform: translate(-16px);
		}
		40%,
		60% {
			transform: translate(16px);
		}
	}
</style>
