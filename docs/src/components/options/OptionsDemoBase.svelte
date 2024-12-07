<script lang="ts">
	import squircle from '$/worklet/squircle?url';
	import { browser } from '$helpers/utils';
	import { draggable, type DragOptions } from '@neodrag/svelte';
	import { untrack, type Snippet } from 'svelte';
	import IonReloadIcon from '~icons/ion/reload';

	interface Props {
		options?: DragOptions;
		position?: any;
		customClass?: string;
		size?: string;
		draggableEl?: HTMLDivElement | undefined;
		styledCaption?: boolean;
		containerEl?: HTMLElement | undefined;

		children?: Snippet;
		caption?: Snippet;
		pos?: Snippet<[x: number, y: number]>;
	}

	let {
		options = {},
		position = $bindable(getDefaultPosition()),
		customClass = '',
		size = '8rem',
		draggableEl = $bindable(undefined),
		styledCaption = true,
		containerEl = $bindable(undefined),

		children,
		caption,
		pos: positionSnippet,
	}: Props = $props();

	let key = $state(0);

	if (browser)
		if ('paintWorklet' in CSS) {
			// @ts-ignore
			CSS.paintWorklet.addModule(squircle);
		}

	type IncludeExclude = (HTMLElement | undefined)[] | undefined;
	function getPawableElements(): [include: IncludeExclude, exclude: IncludeExclude] {
		const arr: [IncludeExclude, IncludeExclude] = [, undefined];

		for (const option of ['handle', 'cancel'] as const) {
			const idx = option === 'handle' ? 0 : 1;

			const optionVal = options[option];

			if (optionVal) {
				// Get all the handle elements inside the draggableEl based on `options.handle`
				if (typeof optionVal === 'string')
					arr[idx] = Array.from<HTMLElement>(draggableEl!.querySelectorAll(optionVal));
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

	function getDefaultPosition() {
		return options.position ?? options.defaultPosition ?? { x: 0, y: 0 };
	}
	let finalOptions = $derived({
		...options,
		position,
		onDrag: (data) => {
			options.onDrag?.(data);
			position = { x: data.offsetX, y: data.offsetY };
		},
	} as DragOptions);

	$effect(() => {
		key;

		untrack(() => (finalOptions.position = position = getDefaultPosition()));
	});

	$effect(() => {
		options; // watch

		if (draggableEl) {
			setPawCursor();
		}
	});
</script>

<section
	class="container options-demo-base-container {customClass}"
	style:--size={size}
	bind:this={containerEl}
>
	{#key key}
		<div class="parent">
			<div class="box" bind:this={draggableEl} use:draggable={finalOptions}>
				{@render children?.()}
			</div>
		</div>

		{#if caption}
			<div class="caption" class:styled={styledCaption}>
				{@render caption?.()}
			</div>
		{/if}
		<div class="offset">
			{#if positionSnippet}
				{@render positionSnippet(position.x, position.y)}
			{:else}
				{position.x}, {position.y}
			{/if}
		</div>
	{/key}

	<button class="reset" onclick={() => key++} title="Reset">
		<IonReloadIcon />
	</button>
</section>

<style lang="scss">
	.container {
		isolation: isolate;

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
		box-shadow:
			0px 12.5px 10px rgba(0, 0, 0, 0.035),
			0px 100px 80px rgba(0, 0, 0, 0.07);

		mask-image: paint(squircle);
		--squircle-radius: 50px;
		--squircle-smooth: 1;

		font-size: 1rem;
		color: var(--app-color-primary-gradient-contrast) !important;
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

		display: grid;
		place-items: center;

		height: 100%;
		width: 100%;

		border-radius: inherit;
	}
</style>
