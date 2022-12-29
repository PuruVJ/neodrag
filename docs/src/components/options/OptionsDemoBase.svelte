<script lang="ts">
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { browser } from 'src/helpers/utils';
	// @ts-ignore
	import IonReloadIcon from '~icons/ion/reload';
	// @ts-ignore
	import squircle from '../../worklet/squircle?url';

	export let options: DragOptions = {};
	export let position = options.position ??
		options.defaultPosition ?? { x: 0, y: 0 };
	export let customClass = '';
	export let size = '8rem';
	export let draggableEl: HTMLDivElement | undefined = undefined;
	export let renderParent = false;
	export let styledCaption = true;

	$: finalOptions = {
		...options,
		position,
		onDrag: (data) => {
			options.onDrag?.(data);
			position = { x: data.offsetX, y: data.offsetY };
		},
	} as DragOptions;

	let key = 0;

	$: {
		key;

		finalOptions.position = position = options.position ??
			options.defaultPosition ?? { x: 0, y: 0 };
	}

	if (browser)
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}

	$: {
		options; // watch

		if (draggableEl) {
			setPawCursor();
		}
	}

	type IncludeExclude = (HTMLElement | undefined)[] | undefined;
	function getPawableElements(): [
		include: IncludeExclude,
		exclude: IncludeExclude
	] {
		const arr: [IncludeExclude, IncludeExclude] = [, undefined];

		for (const option of ['handle', 'cancel'] as const) {
			const idx = option === 'handle' ? 0 : 1;

			const optionVal = options[option];

			if (optionVal) {
				// Get all the handle elements inside the draggableEl based on `options.handle`
				if (typeof optionVal === 'string')
					arr[idx] = Array.from<HTMLElement>(
						draggableEl!.querySelectorAll(optionVal)
					);
				else if (optionVal instanceof HTMLElement) arr[idx] = [optionVal];
				else {
					arr[idx] = optionVal;
				}
			}
		}

		return arr;
	}

	function setPawCursor() {
		const [include = [draggableEl], exclude = []] = getPawableElements();

		for (const el of include) {
			el && (el.dataset.pawCursor = 'true');
		}

		for (const el of exclude) {
			el && (el.dataset.pawCursor = 'false');
		}
	}
</script>

<section
	class="container options-demo-base-container {customClass}"
	style:--size={size}
>
	{#key key}
		{#if renderParent}
			<div class="parent">
				<div class="box" bind:this={draggableEl} use:draggable={finalOptions}>
					<slot />
				</div>
			</div>
		{:else}
			<div class="box" bind:this={draggableEl} use:draggable={finalOptions}>
				<slot />
			</div>
		{/if}

		{#if $$slots.caption}
			<div class="caption" class:styled={styledCaption}>
				<slot name="caption" />
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
		box-shadow: var(--inner-shadow-4);

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
		backdrop-filter: blur(5px);

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

		border-radius: 1.5rem;
		box-shadow: 0px 12.5px 10px rgba(0, 0, 0, 0.035),
			0px 100px 80px rgba(0, 0, 0, 0.07);

		mask-image: paint(squircle);
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		font-size: 1rem;
		color: var(--app-color-primary-contrast) !important;
	}

	.offset {
		position: absolute;
		bottom: 10px;
		right: 10px;

		color: hsla(var(--app-color-dark-hsl), 0.7);
	}

	.caption {
		position: absolute;
		bottom: 2rem;

		display: flex;
		align-items: center;
		gap: 1ch;

		&.styled {
			background-color: hsla(var(--app-color-dark-hsl), 0.1);
			backdrop-filter: blur(40px);

			padding: 0.25rem 0.5rem;

			border-radius: 8px;
		}
	}

	.parent {
		overflow: hidden;
	}
</style>
