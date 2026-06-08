<script lang="ts">
	import FeatureContainer from './FeatureContainer.svelte';

	import squircle from '$/worklet/squircle.js?url';
	import { typingEffect } from '$attachments/typingEffect.svelte';
	import { browser } from '$helpers/utils';
	import { theme } from '$state/user-preferences.svelte';
	import { Draggable } from '@neodrag/svelte';
	import { bounds, BoundsFrom, position } from '@neodrag/svelte/plugins';
	import { onMount } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import PawIcon from '~icons/mdi/paw';

	// This is here so that it gets triggered on homepage
	theme.current;

	let heading_text = 'Try dragging the box below';

	let box_wiggles = $state(true);

	let show_custom_cursor = true;

	let coords_cursor = $state({
		x: 0,
		y: 0,
	});

	let drag_position = new Tween({ x: 0, y: 0 }, { easing: expoOut, duration: 1200 });

	const heroDrag = new Draggable({
		plugins: [bounds(BoundsFrom.parent()), () => position({ current: drag_position.current })],
		onDragStart: () => {
			box_wiggles = false;
		},
		onDrag: ({ offset }) => {
			drag_position.set({ x: offset.x, y: offset.y }, { duration: 0 });
		},
		onDragEnd: () => {
			drag_position.target = { x: 0, y: 0 };
		},
	});

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

<FeatureContainer unstyled unscaled>
	<section class="tagline">
		<div class="intro">
			<div class="top">
				<h1>Neodrag</h1>
				<p class="h4">One draggable to rule them all</p>
			</div>

			<div class="group">
				<a href="/docs/svelte">Getting Started</a>
				<a href="https://github.com/puruvj/neodrag" target="_blank" rel="external"> Github </a>
			</div>
		</div>

		<div class="demo">
			<div class="container">
				{#key heading_text}
					<p class="h3 typewriter-text" class:hidden={false} {@attach typingEffect(60)}>
						{browser ? heading_text : ''}
					</p>
				{/key}

				<div
					class="box"
					class:wiggles={box_wiggles}
					data-paw-cursor="true"
					{...heroDrag.target}
				>
					<div class="paw">
						<PawIcon />
					</div>
				</div>

				<div
					class="cursor"
					style:translate="calc({coords_cursor?.x ?? 0}px - 50%) calc({coords_cursor?.y ?? 0}px -
					50%) 0.000001px"
					style:--opacity={show_custom_cursor && coords_cursor ? 1 : 0}
				>
					<PawIcon style="font-size: 2rem;" />
				</div>
			</div>
		</div>
	</section>
</FeatureContainer>

<style>
	.tagline {
		display: grid;
		box-sizing: border-box;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 5rem;
		padding: 1rem 0;
		min-height: 85dvh;
		width: 100% !important;
		scroll-snap-align: start;
		scroll-snap-stop: always;

		.demo {
			height: 100%;
		}

		@media (max-width: 1223px) {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
			gap: 3rem;
			align-items: initial;
		}

		h1,
		p {
			margin: 0;
		}

		h1 {
			background-image: var(--app-color-primary-gradient);
			background-clip: text;
			-webkit-text-fill-color: transparent;
			font-size: clamp(3rem, 20vw, 8rem);
			line-height: 1.28;
			width: max-content;
		}

		p {
			font-size: clamp(1rem, 5vw, 2rem);
		}
	}

	.intro {
		display: grid;
		gap: 4rem;

		@media (max-width: 1223px) {
			gap: 1rem;
		}
	}

	.group {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 1rem;

		a[href] {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 1rem;
			padding: 1rem 2rem;
			border-radius: 1rem !important;
			font-size: 1.4rem;
			text-align: center;
			color: var(--app-color-primary);

			&:hover {
				color: var(--app-color-primary-contrast);
			}

			@media (max-width: 768px) {
				font-size: 1rem;
				padding: 0.5rem 1rem;
			}
		}
	}

	.container {
		position: relative;

		width: auto;
		height: 100%;

		background-color: color-mix(in lch, var(--app-color-dark), transparent 90%);

		border-radius: 1rem;
		box-shadow: var(--inner-shadow-4);

		display: grid;
		place-items: center;
		place-content: center;
		gap: 2rem;

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

	.typewriter-text {
		position: absolute;
		top: 25%;

		font-family: var(--app-font-mono);
		color: color-mix(in lch, var(--app-color-dark), transparent 40%);
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

		@media (max-height: 900px) {
			top: 10%;
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

			min-width: clamp(calc(0.61 * 4rem), calc(0.61 * 20vw), calc(0.61 * 12rem));
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
