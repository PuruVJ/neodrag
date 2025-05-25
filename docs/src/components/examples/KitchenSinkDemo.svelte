<script lang="ts">
	import { browser } from '$helpers/utils';
	import {
		axis,
		bounds,
		BoundsFrom,
		ControlFrom,
		controls,
		createCompartment,
		disabled,
		draggable,
		events,
		grid,
		position,
		scrollLock,
	} from '@neodrag/svelte';
	//@ts-ignore
	import squircle from '$/worklet/squircle?url';
	import { style } from 'svelte-body';
	import { expoOut, sineIn } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { tick } from 'svelte';

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

	const drag_handlers: Parameters<typeof events>[0] = {
		onDrag: ({ rootNode }) => {
			is_backdrop_visible = true;
			rootNode.style.zIndex = '20';
		},
		onDragEnd: ({ rootNode }) => {
			is_backdrop_visible = false;

			setTimeout(() => {
				update_z_index(rootNode);
			}, 200);
		},
	};

	let return_to_position_val = $state({
		x: 0,
		y: 0,
	});
	const return_to_position_compartment = createCompartment(() => {
		return position({ current: $state.snapshot(return_to_position_val) });
	});

	let return_to_position_transition_val = new Tween(
		{
			x: 0,
			y: 0,
		},
		{ easing: expoOut, duration: 1200 },
	);
	const return_to_position_transition_compartment = createCompartment(() =>
		position({ current: $state.snapshot(return_to_position_transition_val.current) }),
	);

	if (browser)
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}
</script>

<svelte:body
	use:style={{
		boxShadow: hightlight_body ? 'inset 0 0 0 2px var(--app-color-primary)' : '',
	}}
/>

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
			{@attach draggable([events(drag_handlers)])}
		>
			I will drag in all directions
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[1]}
			{@attach draggable([axis('x'), events(drag_handlers)])}
		>
			I will drag horizontally
		</div>

		<div
			class="box"
			style:z-index={z_indices[2]}
			data-paw-cursor="true"
			{@attach draggable([axis('y'), events(drag_handlers)])}
		>
			I will drag vertically
		</div>

		<!-- <div
			class="box"
			style:z-index={z_indices[3]}
			data-paw-cursor="true"
			use:draggable={{ axis: 'none', ...drag_handlers }}
		>
			<span><code>axis: none</code> disables dragging</span>
		</div> -->

		<div
			class="box single-handle"
			style:z-index={z_indices[5]}
			data-paw-cursor="true"
			{@attach draggable([scrollLock(), events(drag_handlers)])}
		>
			I will lock scrolling
		</div>

		<div
			class="box track-position"
			style:z-index={z_indices[4]}
			data-paw-cursor="true"
			{@attach draggable([
				events({
					...drag_handlers,
					onDrag: (data) => {
						drag_handlers.onDrag?.(data);
						track_my_position = { x: data.offset.x, y: data.offset.y };
					},
				}),
			])}
		>
			I track my position:
			<code>x: {track_my_position.x} <br /> y: {track_my_position.y}</code>
		</div>

		<div
			class="box single-handle"
			style:z-index={z_indices[5]}
			{@attach draggable([
				controls({ allow: ControlFrom.selector('.handle') }),
				events(drag_handlers),
			])}
		>
			<button class="handle" data-paw-cursor="true" data-paw-color="light"> Drag here </button>

			I can only be dragged by the handle 👆
		</div>

		<div
			class="box multiple-handles"
			style:z-index={z_indices[6]}
			{@attach draggable([
				controls({ allow: ControlFrom.selector('.handle') }),
				events(drag_handlers),
			])}
		>
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
			{@attach draggable([
				controls({ block: ControlFrom.selector('.cancel') }),
				events(drag_handlers),
			])}
		>
			I can be dragged anywhere

			<button class="cancel" data-paw-cursor="false"> except for this box </button>
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[8]}
			{@attach draggable([grid([25, 25]), events(drag_handlers)])}
		>
			I snap to 25x25 grid
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[9]}
			{@attach draggable([grid([100, 25]), events(drag_handlers)])}
		>
			I snap to 100x25 grid
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[10]}
			{@attach draggable([
				bounds(BoundsFrom.parent()),
				events({
					onDrag: ({ rootNode }) => {
						highlight_parent = true;
						rootNode.style.zIndex = '20';
					},
					onDragEnd: ({ rootNode }) => {
						highlight_parent = false;

						setTimeout(() => {
							update_z_index(rootNode);
						}, 200);
					},
				}),
			])}
		>
			I can be dragged within my parents container only
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[11]}
			{@attach draggable([
				bounds(BoundsFrom.selector('body')),
				events({
					onDrag: ({ rootNode }) => {
						hightlight_body = true;
						rootNode.style.zIndex = '20';
					},
					onDragEnd: ({ rootNode }) => {
						hightlight_body = false;

						setTimeout(() => {
							update_z_index(rootNode);
						}, 200);
					},
				}),
			])}
		>
			I can be dragged within the body
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[12]}
			{@attach draggable([
				bounds(BoundsFrom.viewport(coord_bounds)),
				events({
					onDrag: ({ rootNode }) => {
						show_markers = true;
						rootNode.style.zIndex = '20';
					},
					onDragEnd: ({ rootNode }) => {
						show_markers = false;

						setTimeout(() => {
							update_z_index(rootNode);
						}, 200);
					},
				}),
			])}
		>
			Bounds
			<code>top: 20 <br /> bottom: 50 <br /> left: 200 <br /> right: 400</code>
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[13]}
			{@attach draggable(() => [
				return_to_position_compartment,
				events({
					onDrag: (data) => {
						drag_handlers.onDrag?.(data);
						return_to_position_val = { x: data.offset.x, y: data.offset.y };
					},
					onDragEnd: async (data) => {
						drag_handlers.onDragEnd?.(data);
						return_to_position_val = { x: 0, y: 0 };
					},
				}),
			])}
		>
			I will return to my position on drop
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[14]}
			{@attach draggable(() => [
				return_to_position_transition_compartment,
				events({
					onDrag: (data) => {
						drag_handlers.onDrag?.(data);
						return_to_position_transition_val.set(
							{ x: data.offset.x, y: data.offset.y },
							{ duration: 0 },
						);
					},
					onDragEnd: async (data) => {
						drag_handlers.onDragEnd?.(data);
						return_to_position_transition_val.target = { x: 0, y: 0 };
					},
				}),
			])}
		>
			I will return to my position on drop, but with style! 😉
		</div>

		<div
			class="box"
			data-paw-cursor="true"
			style:z-index={z_indices[15]}
			{@attach draggable([disabled(), events(drag_handlers)])}
		>
			<code>disabled: true</code>

			Can't drag me at all
		</div>
	</div>
{/key}

<button onclick={() => reset++}>Reset examples</button>

<style lang="scss">
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
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		&:global(.neodrag-dragging) {
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
