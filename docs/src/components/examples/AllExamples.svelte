<script lang="ts">
	import { draggable, DragOptions } from '@neodrag/svelte';
	import { browser } from 'src/helpers/utils';
	//@ts-ignore
	import squircle from 'src/worklet/squircle?url';
	import { style } from 'svelte-body';
	import { expoOut, sineIn } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	let reset = 0;

	let trackMyPosition = {
		x: 0,
		y: 0,
	};

	let highlightParent = false;
	let hightlightBody = false;
	let showMarkers = false;

	let coordBounds = {
		top: 100,
		left: 200,
		bottom: 200,
		right: 100,
	};

	let isBackdropVisible = false;

	let zIndices = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	function getNodeIndex(node: HTMLElement) {
		return Array.from(node.parentNode?.children!).indexOf(node);
	}

	/**
	 * This function updates z index of selected element. But if any element has z index of more than 50,
	 * it reduces z index of all of them by the minimum z index of all elements.
	 * @param node
	 */
	function updateZIndex(node: HTMLElement) {
		const index = getNodeIndex(node);
		zIndices[index] = Math.max(...zIndices) + 1;

		// get the lowest non zero index from the z index array
		const lowestZIndex = zIndices.reduce((acc, curr) => {
			if (curr === 0) return acc;
			return Math.min(acc, curr);
		}, Infinity);

		if (zIndices[index] > zIndices.length) {
			zIndices = zIndices.map((z) =>
				z >= lowestZIndex ? z - lowestZIndex : z
			);
		}
	}

	const dragHandlers: Pick<
		DragOptions,
		'onDrag' | 'onDragStart' | 'onDragEnd'
	> = {
		onDrag: ({ node }) => {
			isBackdropVisible = true;
			node.style.zIndex = '20';
		},
		onDragEnd: ({ node }) => {
			isBackdropVisible = false;

			setTimeout(() => {
				updateZIndex(node);
			}, 200);
		},
	};

	let returnToPositionVal = {
		x: 0,
		y: 0,
	};

	let returnToPositionTransitionVal = tweened(
		{
			x: 0,
			y: 0,
		},
		{ easing: expoOut, duration: 1200 }
	);

	if (browser)
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}
</script>

<svelte:body
	use:style={{
		boxShadow: hightlightBody ? 'inset 0 0 0 2px var(--app-color-primary)' : '',
	}}
/>

{#if isBackdropVisible || showMarkers}
	<div class="backdrop" transition:fade={{ duration: 200, easing: sineIn }} />
{/if}

<div
	class="markers"
	class:visible={showMarkers}
	style:--top="{coordBounds.top}px"
	style:--right="{coordBounds.right}px"
	style:--bottom="{coordBounds.bottom}px"
	style:--left="{coordBounds.left}px"
>
	<div class="hider">You can only drag it within these constraints</div>

	<div class="top">
		<span>{coordBounds.top}</span>
	</div>
	<div class="right">
		<span>{coordBounds.right}</span>
	</div>
	<div class="bottom">
		<span>{coordBounds.bottom}</span>
	</div>
	<div class="left">
		<span>{coordBounds.left}</span>
	</div>
</div>

{#key reset}
	<button on:click={() => reset++}>Reset examples</button>
	<div class="examples-container" class:highlight={highlightParent}>
		<div
			class="box"
			style:z-index={zIndices[0]}
			use:draggable={{ ...dragHandlers }}
		>
			I will drag in all directions
		</div>

		<div
			class="box"
			style:z-index={zIndices[1]}
			use:draggable={{ axis: 'x', ...dragHandlers }}
		>
			I will drag horizontally
		</div>

		<div
			class="box"
			style:z-index={zIndices[2]}
			use:draggable={{ axis: 'y', ...dragHandlers }}
		>
			I will drag vertically
		</div>

		<div
			class="box"
			style:z-index={zIndices[3]}
			use:draggable={{ axis: 'none', ...dragHandlers }}
		>
			<span><code>axis: none</code> disables dragging</span>
		</div>

		<div
			class="box track-position"
			style:z-index={zIndices[4]}
			use:draggable={{
				...dragHandlers,
				onDrag: ({ offsetX, offsetY, domRect, node }) => {
					dragHandlers.onDrag?.({ offsetX, offsetY, domRect, node });
					trackMyPosition = { x: offsetX, y: offsetY };
				},
			}}
		>
			I track my position:
			<code>x: {trackMyPosition.x} <br /> y: {trackMyPosition.y}</code>
		</div>

		<div
			class="box"
			style:z-index={zIndices[5]}
			use:draggable={{ handle: '.handle', ...dragHandlers }}
		>
			<button class="handle">Drag here</button>

			I can only be dragged by the handle 👆
		</div>

		<div
			class="box multiple-handles"
			style:z-index={zIndices[6]}
			use:draggable={{ handle: '.handle', ...dragHandlers }}
		>
			I can be dragged with all the handles

			<div class="handle" />
			<div class="handle" />
			<div class="handle" />
			<div class="handle" />
		</div>

		<div
			class="box"
			style:z-index={zIndices[7]}
			use:draggable={{ cancel: '.cancel', ...dragHandlers }}
		>
			I can be dragged anywhere

			<button
				class="cancel"
				style:color="hsla(var(--app-color-primary-contrast-hsl), 0.6)"
				style:font-size="0.8rem"
			>
				except for this box
			</button>
		</div>

		<div
			class="box"
			style:z-index={zIndices[8]}
			use:draggable={{ grid: [25, 25], ...dragHandlers }}
		>
			I snap to 25x25 grid
		</div>

		<div
			class="box"
			style:z-index={zIndices[9]}
			use:draggable={{ grid: [100, 25], ...dragHandlers }}
		>
			I snap to 100x25 grid
		</div>

		<div
			class="box"
			style:z-index={zIndices[10]}
			use:draggable={{
				bounds: 'parent',
				onDrag: ({ node }) => {
					highlightParent = true;
					node.style.zIndex = '20';
				},

				onDragEnd: ({ node }) => {
					highlightParent = false;

					setTimeout(() => {
						updateZIndex(node);
					}, 200);
				},
			}}
		>
			I can be dragged within my parents container only
		</div>

		<div
			class="box"
			style:z-index={zIndices[11]}
			use:draggable={{
				bounds: 'body',
				onDrag: ({ node }) => {
					hightlightBody = true;
					node.style.zIndex = '20';
				},
				onDragEnd: ({ node }) => {
					hightlightBody = false;

					setTimeout(() => {
						updateZIndex(node);
					}, 200);
				},
			}}
		>
			I can be dragged within the body
		</div>

		<div
			class="box"
			style:z-index={zIndices[12]}
			use:draggable={{
				bounds: coordBounds,
				onDrag: ({ node }) => {
					showMarkers = true;
					node.style.zIndex = '20';
				},
				onDragEnd: ({ node }) => {
					showMarkers = false;

					setTimeout(() => {
						updateZIndex(node);
					}, 200);
				},
			}}
		>
			Bounds
			<code>top: 20 <br /> bottom: 50 <br /> left: 200 <br /> right: 400</code>
		</div>

		<div
			class="box"
			style:z-index={zIndices[13]}
			use:draggable={{
				position: returnToPositionVal,
				onDrag: (data) => {
					dragHandlers.onDrag?.(data);
					returnToPositionVal = { x: data.offsetX, y: data.offsetY };
				},
				onDragEnd: (data) => {
					dragHandlers.onDragEnd?.(data);
					returnToPositionVal = { x: 0, y: 0 };
				},
			}}
		>
			I will return to my position on drop
		</div>

		<div
			class="box"
			style:z-index={zIndices[14]}
			use:draggable={{
				position: $returnToPositionTransitionVal,
				onDrag: (data) => {
					dragHandlers.onDrag?.(data);
					returnToPositionTransitionVal.set(
						{ x: data.offsetX, y: data.offsetY },
						{ duration: 0 }
					);
				},
				onDragEnd: (data) => {
					dragHandlers.onDragEnd?.(data);
					$returnToPositionTransitionVal = { x: 0, y: 0 };
				},
			}}
		>
			I will return to my position on drop, but with style! 😉
		</div>

		<div
			class="box"
			style:z-index={zIndices[15]}
			use:draggable={{ disabled: true, ...dragHandlers }}
		>
			<code>disabled: true</code>

			Can't drag me at all
		</div>
	</div>
{/key}

<style lang="scss">
	.examples-container {
		display: grid;
		grid-template-columns: repeat(auto-fill, 175px);
		gap: 1rem;
		place-content: center;

		min-width: 0;
		width: 100%;
		max-width: 60rem;

		padding: 1rem;

		border-radius: 0.5rem;

		&.highlight {
			box-shadow: inset 0 0 0 2px var(--app-color-primary);
		}

		* {
			color: var(--app-color-dark-contrast);
		}
	}

	.box {
		--size: 175px;

		position: relative;

		display: grid;
		place-content: center;

		text-align: center;

		width: var(--size);
		height: var(--size);

		background-color: var(--app-color-dark);

		box-shadow: 0px 12.5px 10px rgba(0, 0, 0, 0.035),
			0px 100px 80px rgba(0, 0, 0, 0.07);
		border-radius: 0.5rem;

		mask-image: paint(squircle);
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		font-size: large;

		&:global(.neodrag-dragging) {
			background-color: var(--app-color-primary);
			color: var(--app-color-primary-contrast);
		}
	}

	.box.track-position code {
		width: 80%;

		text-align: start;
	}

	.box.multiple-handles {
		position: relative;

		padding: 2rem;

		.handle {
			position: absolute;

			border-radius: 20px;

			background-color: var(--app-color-primary-contrast);

			transition: all 100ms ease-in;
			cursor: move;
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

				box-shadow: inset var(--marker-size) var(--marker-size) 0px 1px
					var(--app-color-primary);

				height: calc(var(--marker-size) * 8);
				width: calc(var(--marker-size) * 8);

				transform: translate(var(--translate)) rotate(var(--rotate))
					scale(var(--scale));
			}
		}
	}
</style>
