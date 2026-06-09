<script lang="ts">
	import squircle from '$/worklet/squircle?url';
	import { browser } from '$helpers/utils';
	import { Draggable, scrollLock, type DragEventData } from '@neodrag/svelte';
	import { expoOut, sineIn } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	let reset = $state(0);

	$effect(() => {
		reset;

		track_my_position = {
			x: 0,
			y: 0,
		};
	});

	let track_my_position = $state({
		x: 0,
		y: 0,
	});

	let highlight_parent = $state(false);
	let hightlight_body = $state(false);
	let show_markers = $state(false);

	let coord_bounds = {
		top: 100,
		left: 200,
		bottom: 200,
		right: 100,
	};

	let is_backdrop_visible = $state(false);

	let z_indices = $state(Array.from<number>({ length: 15 }).fill(0));

	function get_node_index(node: HTMLElement) {
		return Array.from(node.parentNode?.children!).indexOf(node);
	}

	/**
	 * This function updates z index of selected element. But if any element has z index of more than 50,
	 * it reduces z index of all of them by the minimum z index of all elements.
	 * @param node
	 */
	function update_z_index(node: HTMLElement | SVGElement) {
		if (node instanceof SVGElement) return;

		const index = get_node_index(node);
		z_indices[index] = Math.max(...z_indices) + 1;

		// get the lowest non zero index from the z index array
		const lowest_z_index = z_indices.reduce((acc, curr) => {
			if (curr === 0) return acc;
			return Math.min(acc, curr);
		}, Infinity);

		if (z_indices[index] > z_indices.length) {
			z_indices = z_indices.map((z) => (z >= lowest_z_index ? z - lowest_z_index : z));
		}
	}

	const drag_handlers = {
		onDrag: ({ node }: DragEventData) => {
			is_backdrop_visible = true;
			node.style.zIndex = '20';
		},
		onDragEnd: ({ node }: DragEventData) => {
			is_backdrop_visible = false;

			setTimeout(() => {
				update_z_index(node);
			}, 200);
		},
	};

	let return_to_position_val = $state({
		x: 0,
		y: 0,
	});
	let return_to_position_transition_val = new Tween(
		{
			x: 0,
			y: 0,
		},
		{ easing: expoOut, duration: 1200 },
	);

	if (browser)
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}

	$effect(() => {
		document.body.style.boxShadow = hightlight_body
			? 'inset 0 0 0 2px var(--app-color-primary)'
			: '';
	});

	const drag_0 = new Draggable({ ...drag_handlers });
	const drag_1 = new Draggable({ axis: 'x', ...drag_handlers });
	const drag_2 = new Draggable({ axis: 'y', ...drag_handlers });
	const drag_3 = new Draggable({ use: [scrollLock()], ...drag_handlers });
	const drag_4 = new Draggable({
		...drag_handlers,
		onDrag(data) {
			drag_handlers.onDrag?.(data);
			track_my_position = { x: data.offset.x, y: data.offset.y };
		},
	});
	const drag_5 = new Draggable({
		controls: { handle: '.handle' },
		...drag_handlers,
	});
	const drag_5b = new Draggable({
		controls: { handle: '.handle' },
		...drag_handlers,
	});
	const drag_6 = new Draggable({
		controls: { cancel: '.cancel' },
		...drag_handlers,
	});
	const drag_7 = new Draggable({ grid: [25, 25], ...drag_handlers });
	const drag_8 = new Draggable({ grid: [100, 25], ...drag_handlers });
	const drag_9 = new Draggable({
		bounds: 'parent',
		onDrag: ({ node }) => {
			highlight_parent = true;
			node.style.zIndex = '20';
		},
		onDragEnd: ({ node }) => {
			highlight_parent = false;
			setTimeout(() => update_z_index(node), 200);
		},
	});
	const drag_10 = new Draggable({
		bounds: () => document.body.getBoundingClientRect(),
		onDrag: ({ node }) => {
			hightlight_body = true;
			node.style.zIndex = '20';
		},
		onDragEnd: ({ node }) => {
			hightlight_body = false;
			setTimeout(() => update_z_index(node), 200);
		},
	});
	const drag_11 = new Draggable({
		bounds: () => ({
			left: coord_bounds.left,
			top: coord_bounds.top,
			right: window.innerWidth - coord_bounds.right,
			bottom: window.innerHeight - coord_bounds.bottom,
		}),
		onDrag: ({ node }) => {
			show_markers = true;
			node.style.zIndex = '20';
		},
		onDragEnd: ({ node }) => {
			show_markers = false;
			setTimeout(() => update_z_index(node), 200);
		},
	});
	const drag_12 = new Draggable({
		get position() {
			return return_to_position_val;
		},
		onDrag(data) {
			drag_handlers.onDrag?.(data);
			return_to_position_val = { x: data.offset.x, y: data.offset.y };
		},
		onDragEnd: (data) => {
			drag_handlers.onDragEnd?.(data);
			return_to_position_val = { x: 0, y: 0 };
		},
	});
	const drag_13 = new Draggable({
		get position() {
			return return_to_position_transition_val.current;
		},
		onDrag(data) {
			drag_handlers.onDrag?.(data);
			return_to_position_transition_val.set(
				{ x: data.offset.x, y: data.offset.y },
				{ duration: 0 },
			);
		},
		onDragEnd: (data) => {
			drag_handlers.onDragEnd?.(data);
			return_to_position_transition_val.target = { x: 0, y: 0 };
		},
	});
	const drag_14 = new Draggable({ disabled: true, ...drag_handlers });
</script>

{#if is_backdrop_visible || show_markers}
	<div class="backdrop" transition:fade={{ duration: 200, easing: sineIn }}></div>
{/if}

<div
	class="markers"
	class:visible={show_markers}
	style:--top="{coord_bounds.top}px"
	style:--right="{coord_bounds.right}px"
	style:--bottom="{coord_bounds.bottom}px"
	style:--left="{coord_bounds.left}px"
>
	<div class="hider">You can only drag it within these constraints</div>

	<div class="top">
		<span>{coord_bounds.top}</span>
	</div>
	<div class="right">
		<span>{coord_bounds.right}</span>
	</div>
	<div class="bottom">
		<span>{coord_bounds.bottom}</span>
	</div>
	<div class="left">
		<span>{coord_bounds.left}</span>
	</div>
</div>

{#key reset}
	<div class="examples-container" class:highlight={highlight_parent}>
		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[0]}
			{...drag_0.attach}
		>
			I will drag in all directions
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[1]}
			{...drag_1.attach}
		>
			I will drag horizontally
		</div>

		<div
			class="box"
			style:z-index={z_indices[2]}
			data-paw-cursor="true"
			{...drag_2.attach}
		>
			I will drag vertically
		</div>

		<div
			class="box single-handle"
			style:z-index={z_indices[5]}
			data-paw-cursor="true"
			{...drag_3.attach}
		>
			I will lock scrolling
		</div>

		<div
			class="box track-position"
			style:z-index={z_indices[4]}
			data-paw-cursor="true"
			{...drag_4.attach}
		>
			I track my position:
			<code>x: {track_my_position.x} <br /> y: {track_my_position.y}</code>
		</div>

		<div class="box single-handle" style:z-index={z_indices[5]} {...drag_5.attach}>
			<button class="handle" data-paw-cursor="true" data-paw-color="light"> Drag here </button>

			I can only be dragged by the handle 👆
		</div>

		<div class="box multiple-handles" style:z-index={z_indices[6]} {...drag_5b.attach}>
			I can be dragged with all the handles

			<div class="handle" data-paw-cursor="true"></div>
			<div class="handle" data-paw-cursor="true"></div>
			<div class="handle" data-paw-cursor="true"></div>
			<div class="handle" data-paw-cursor="true"></div>
		</div>

		<div
			class="box"
			style:z-index={z_indices[7]}
			data-paw-cursor="true"
			{...drag_6.attach}
		>
			I can be dragged anywhere

			<button class="cancel" data-paw-cursor="false"> except for this box </button>
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[8]}
			{...drag_7.attach}
		>
			I snap to 25x25 grid
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[9]}
			{...drag_8.attach}
		>
			I snap to 100x25 grid
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[10]}
			{...drag_9.attach}
		>
			I can be dragged within my parents container only
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[11]}
			{...drag_10.attach}
		>
			I can be dragged within the body
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[12]}
			{...drag_11.attach}
		>
			Bounds
			<code>top: 20 <br /> bottom: 50 <br /> left: 200 <br /> right: 400</code>
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[13]}
			{...drag_12.attach}
		>
			I will return to my position on drop
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[14]}
			{...drag_13.attach}
		>
			I will return to my position on drop, but with style! 😉
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[15]}
			{...drag_14.attach}
		>
			<code>disabled: true</code>

			Can't drag me at all
		</div>
	</div>
{/key}

<button onclick={() => reset++}>Reset examples</button>

<style>
	.examples-container {
		--size: clamp(120px, 20vw, 175px);

		display: grid;
		grid-template-columns: repeat(auto-fill, var(--size));
		gap: 1rem;
		place-content: center;

		min-width: 0;
		width: 100%;
		max-width: 70rem;

		padding: 1rem 7rem;

		border-radius: 0.5rem;

		&.highlight {
			box-shadow: inset 0 0 0 2px var(--app-color-primary);
		}

		@media (max-width: 768px) {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
			padding: 0;
			gap: 2rem;
			justify-content: center;
		}

		* {
			color: var(--app-color-light-contrast);
		}
	}

	.box {
		position: relative;

		display: grid;
		place-content: center;

		text-align: center;
		font-size: clamp(0.8rem, 2vw, 1rem);

		width: var(--size);
		height: var(--size);

		padding: 0.5rem;

		background-color: var(--app-color-light);

		box-shadow:
			0px 12.5px 10px rgba(0, 0, 0, 0.035),
			0px 100px 80px rgba(0, 0, 0, 0.07);
		border-radius: 0.5rem;

		mask-image: paint(squircle);
		-webkit-mask-image: paint(squircle);
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		&:global([data-neodrag-dragging]) {
			background-color: var(--app-color-primary);
			color: var(--app-color-primary-contrast);

			--opacity: 1;
		}

		&::before {
			content: '';

			position: absolute;
			top: 0;
			left: 0;
			z-index: -1;

			height: 100%;
			width: 100%;

			opacity: var(--opacity, 0);

			transition: opacity 150ms ease-in;

			background-image: var(--app-color-primary-gradient);
		}
	}

	.box.track-position code {
		width: 80%;

		text-align: start;
	}

	.box.single-handle .handle {
		background: var(--app-color-dark);
		color: var(--app-color-light);

		border-radius: 24px;
	}

	.box .cancel {
		background-color: hsla(var(--app-color-dark-hsl), 0.4);
		color: var(--app-color-dark);

		border-radius: 24px;

		cursor: not-allowed;
	}

	.box.multiple-handles {
		position: relative;

		padding: 2rem;

		.handle {
			position: absolute;

			border-radius: 20px;

			background-color: var(--app-color-dark);

			transition: all 100ms ease-in;
		}

		.handle:nth-child(1) {
			top: 5%;
			left: 20%;

			width: 60%;
			height: 6px;
		}

		.handle:nth-child(2) {
			top: 20%;
			left: 5%;

			width: 6px;
			height: 60%;
		}

		.handle:nth-child(3) {
			bottom: 5%;
			left: 20%;

			width: 60%;
			height: 6px;
		}

		.handle:nth-child(4) {
			top: 20%;
			right: 5%;

			width: 6px;
			height: 60%;
		}
	}

	.box code {
		color: var(--app-color-dark) !important;
	}

	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 19;

		pointer-events: none;

		height: 100vh;
		width: 100vw;

		backdrop-filter: blur(20px) brightness(0.5);
	}

	.markers {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 19;

		pointer-events: none;

		height: 100vh;
		width: 100vw;

		opacity: 0;

		transition: opacity 200ms ease-in;

		&.visible {
			opacity: 1;

			pointer-events: all;
		}

		.hider {
			position: fixed;
			top: 0;
			left: 0;

			display: grid;
			place-content: center;

			height: calc(100vh - var(--top) - var(--bottom));
			width: calc(100vw - var(--left) - var(--right));

			top: var(--top);
			left: var(--left);

			background-color: var(--app-color-shell);

			border-radius: 1rem;

			color: hsla(var(--app-color-dark-hsl), 0.7);
		}

		> div:not(.hider) {
			--marker-size: 2px;

			position: fixed;

			display: grid;
			place-content: center;

			font-size: large;

			pointer-events: none;

			background-color: var(--app-color-primary);

			&.top,
			&.bottom {
				left: calc(((100vw - var(--left) - var(--right)) / 2) + var(--left));

				width: var(--marker-size);

				&::before,
				&::after {
					--translate: -44%, 0;
				}

				&::before {
					--rotate: 45deg;

					top: 0;
				}

				&::after {
					--rotate: -135deg;

					bottom: 0;
				}
			}

			&.left,
			&.right {
				top: calc(((100vh - var(--top) - var(--bottom)) / 2) + var(--top));

				height: var(--marker-size);

				&::before,
				&::after {
					--translate: 0, -44%;
				}

				&::before {
					--rotate: -45deg;

					left: 0;
				}

				&::after {
					--rotate: 135deg;

					right: 0;
				}
			}

			&.top {
				top: 0;

				height: var(--top);

				> span {
					transform: translateX(75%) rotate(90deg);
				}
			}

			&.left {
				left: 0;

				width: var(--left);

				> span {
					transform: translateY(-75%);
				}
			}

			&.right {
				right: 0;

				width: var(--right);

				> span {
					transform: translateY(-75%);
				}
			}

			&.bottom {
				bottom: 0;

				height: var(--bottom);

				> span {
					transform: translateX(75%) rotate(90deg);
				}
			}

			&::before,
			&::after {
				--translate: 0, -40%;
				--rotate: 0;
				--scale: 0.78;

				position: absolute;

				display: inline-block;

				content: '';

				box-shadow: inset var(--marker-size) var(--marker-size) 0px 1px var(--app-color-primary);

				height: calc(var(--marker-size) * 8);
				width: calc(var(--marker-size) * 8);

				transform: translate(var(--translate)) rotate(var(--rotate)) scale(var(--scale));
			}
		}
	}
</style>
