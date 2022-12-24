<script lang="ts">
	import { draggable } from '@neodrag/svelte';
	import { onMount } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { typingEffect } from '$actions/typingEffect';

	// @ts-ignore
	import squircle from '../../worklet/squircle.js?url';
	// @ts-ignore
	import PawIcon from '~icons/mdi/paw';

	import { browser } from 'src/helpers/utils';

	let headingText = 'Try dragging the box below';

	let boxWiggles = true;

	let showCustomCursor = true;

	let coordsCursor: {
		x: number;
		y: number;
	};

	let dragPosition = tweened(
		{ x: 0, y: 0 },
		{ easing: expoOut, duration: 1200 }
	);

	function handleMouseMove(e: MouseEvent) {
		coordsCursor ??= { x: 0, y: 0 };

		coordsCursor.x = e.clientX;
		coordsCursor.y = e.clientY;
	}

	onMount(() => {
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}
	});
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div class="container">
	{#key headingText}
		<p class="h3" class:hidden={false} use:typingEffect={60}>
			{browser ? headingText : ''}
		</p>
	{/key}

	<div
		class="box"
		class:wiggles={boxWiggles}
		use:draggable={{
			bounds: 'parent',
			position: $dragPosition,
			onDragStart: () => {
				boxWiggles = false;
			},
			onDrag: ({ offsetX, offsetY }) =>
				dragPosition.set({ x: offsetX, y: offsetY }, { duration: 0 }),
			onDragEnd: () => {
				$dragPosition = { x: 0, y: 0 };
			},
		}}
	>
		<div class="paw">
			<PawIcon style="font-size: 7.37rem;" />
		</div>
	</div>

	<div
		class="cursor"
		style:transform="translate3d(calc({coordsCursor?.x ?? 0}px - 50%), calc({coordsCursor?.y ??
			0}px - 50%), 0)"
		style:--opacity={showCustomCursor && coordsCursor ? 1 : 0}
	>
		<PawIcon style="font-size: 2rem;" />
	</div>
</div>

<style lang="scss">
	.container {
		width: auto;
		height: 100%;

		background-color: hsla(var(--app-color-dark-hsl), 0.1);

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

		&:hover {
			.cursor {
				display: block;
			}
		}
	}

	p {
		position: absolute;
		top: 25vh;

		font-family: var(--app-font-mono);
		color: hsla(var(--app-color-dark-hsl), 0.6);
		word-spacing: 4px;

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
		--size: 12rem;

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
		box-shadow: 0px 12.5px 10px rgba(0, 0, 0, 0.035),
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
		position: absolute;
		bottom: 6px;
		right: 6px;

		opacity: 0;

		transform: scale(0.6);

		transition: 0.1s ease-in-out;
		transition-property: opacity, transform;

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
