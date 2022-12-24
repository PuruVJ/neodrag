<script lang="ts">
	import { draggable, DragOptions } from '@neodrag/svelte';
	import { onMount } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	// @ts-ignore
	import squircle from 'src/worklet/squircle?url';
	// @ts-ignore
	import IonReloadIcon from '~icons/ion/reload';
	import FeatureRichContols from './FeatureRichContols.svelte';

	let options: DragOptions = {
		axis: 'both',
		bounds: undefined,
		applyUserSelectHack: true,
		cancel: undefined,
		defaultClass: 'neodrag',
		defaultClassDragged: 'neodrag-dragged',
		defaultClassDragging: 'neodrag-dragging',
		defaultPosition: undefined,
		disabled: false,
		gpuAcceleration: true,
		grid: undefined,
		handle: undefined,
		ignoreMultitouch: true,
		position: undefined,
	};

	let position = tweened(getInitialPosition(), {
		easing: expoOut,
		duration: 1200,
	});

	$: finalOptions = {
		...options,
		position: $position,
		onDrag: (data) => {
			options.onDrag?.(data);
			position.set({ x: data.offsetX, y: data.offsetY }, { duration: 0 });
		},
	} as DragOptions;

	function getInitialPosition() {
		return options.position ?? options.defaultPosition ?? { x: 0, y: 0 };
	}

	onMount(() => {
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}
	});
</script>

<div class="demo">
	<div class="container-box">
		<div data-paw-cursor="true" class="box" use:draggable={finalOptions} />

		<button
			class="reset"
			on:click={() => ($position = getInitialPosition())}
			title="Reset"
		>
			<IonReloadIcon />
		</button>

		<div class="offset">
			{$position.x.toFixed(0)}, {$position.y.toFixed(0)}
		</div>
	</div>
</div>

<div class="options">
	<FeatureRichContols bind:options={finalOptions} />
</div>

<style lang="scss">
	.container-box {
		position: relative;

		display: grid;
		place-items: center;

		border-radius: 1rem 1rem;
		box-shadow: var(--inner-shadow-4);

		height: 40rem;
		width: 100%;

		overflow: hidden;

		background-color: hsla(var(--app-color-dark-hsl), 0.1);
	}

	.reset {
		position: absolute;
		right: 8px;
		top: 8px;

		font-size: 1.2rem;

		padding: 0.5rem;

		border-radius: 8px;

		background-color: hsla(var(--app-color-dark-hsl), 0.3);
		backdrop-filter: blur(5px) brightness(50%) grayscale(0.4);

		&:hover :global(svg) {
			transform: rotate(100deg) scale(1.2);
		}

		:global(svg) {
			transition: transform 0.2s ease-in-out;

			color: var(--app-color-dark);
		}
	}

	.box {
		position: relative;

		display: grid;
		place-content: center;

		text-align: center;

		width: var(--size, 8rem);
		height: var(--size, 8rem);

		padding: 1rem;

		background-image: var(--app-color-primary-gradient);

		border-radius: 1rem 1rem 0 0;
		box-shadow: 0px 12.5px 10px rgba(0, 0, 0, 0.035),
			0px 100px 80px rgba(0, 0, 0, 0.07);

		mask-image: paint(squircle);
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		font-size: 1rem;
		color: var(--app-color-primary-contrast);
	}

	.offset {
		position: absolute;
		bottom: 10px;
		right: 10px;

		color: hsla(var(--app-color-dark-hsl), 0.7);
	}
</style>
