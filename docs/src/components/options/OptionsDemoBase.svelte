<script lang="ts">
	import IonReloadIcon from '~icons/ion/reload';
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { browser } from 'src/helpers/utils';
	import squircle from 'src/worklet/squircle?url';

	export let options: DragOptions = {};
	export let customClass = '';

	let position = options.position ?? options.defaultPosition ?? { x: 0, y: 0 };

	let key = 0;

	$: {
		key;

		position = options.position ?? options.defaultPosition ?? { x: 0, y: 0 };
	}

	if (browser)
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}
</script>

<section class="container options-demo-base-container {customClass}">
	{#key key}
		<div class="parent">
			<slot name="parent-contents" />

			<div
				class="box"
				use:draggable={{
					...options,
					onDrag: (data) => {
						options.onDrag?.(data);
						position = { x: data.offsetX, y: data.offsetY };
					},
				}}
			>
				<slot />
			</div>
		</div>

		{#if $$slots.bottom}
			<div class="bottom">
				<slot name="bottom" />
			</div>
		{/if}

		<div class="offset">
			<slot name="position" x={position.x} y={position.y}>
				{position.x}, {position.y}
			</slot>
		</div>
	{/key}

	<button class="reset" on:click={() => key++} title="Reset">
		<IonReloadIcon />
	</button>
</section>

<style lang="scss">
	.container {
		position: relative;

		display: grid;
		place-items: center;

		border-radius: 1rem 1rem 0 0;

		height: 25rem;
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
		--size: 8rem;

		position: relative;

		display: grid;
		place-content: center;

		text-align: center;

		width: var(--size);
		height: var(--size);

		padding: 1rem;

		background-image: var(--app-color-primary-gradient);

		border-radius: 0.5rem;
		box-shadow: 0px 12.5px 10px rgba(0, 0, 0, 0.035), 0px 100px 80px rgba(0, 0, 0, 0.07);

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

	.bottom {
		position: absolute;
		bottom: 2rem;
	}
</style>
