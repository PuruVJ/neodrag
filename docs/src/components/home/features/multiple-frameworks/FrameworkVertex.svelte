<script lang="ts">
	import { portal } from '$actions/portal';
	import { draggable } from '@neodrag/svelte';
	import type { Framework } from 'src/helpers/constants';
	import { createEventDispatcher, onDestroy } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	import { elementsOverlap } from '$helpers/utils';

	export let logoEl: HTMLImageElement;
	export let framework: Framework;
	export let resetFns: Record<Framework, () => void>;

	const dispatch = createEventDispatcher<{
		select: { framework: Framework };
	}>();

	$: if (framework) {
		resetFns[framework] = reset;
	}

	const reset = () => {
		$draggablePosition = { x: 0, y: 0 };
	};

	let buttonEl: HTMLButtonElement;

	let lineProperties = {
		thickness: 2,
		left: 0,
		top: 0,
		width: 0,
		angle: 0,
	};

	let draggablePosition = tweened(
		{ x: 0, y: 0 },
		{ easing: expoOut, duration: 1200 }
	);

	$: {
		$draggablePosition;

		if (buttonEl && logoEl) updateLinePosition(buttonEl, logoEl);
	}

	let lastDraggingTime: null | Date = null;

	function getOffset(el: HTMLElement) {
		const rect = el.getBoundingClientRect();

		return {
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY,
			width: rect.width || el.offsetWidth,
			height: rect.height || el.offsetHeight,
		};
	}

	const THICKNESS = 2;

	function updateLinePosition(node: HTMLElement, rootEl: HTMLElement) {
		if (!rootEl) return;

		const rootRect = getOffset(rootEl);
		const nodeRect = getOffset(node);

		const x1 = rootRect.left + rootRect.width / 2;
		const y1 = rootRect.top + rootRect.height / 2;
		// top right
		const x2 = nodeRect.left + nodeRect.width / 2;
		const y2 = nodeRect.top + nodeRect.height / 2;
		// distance
		const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

		const cx = (x1 + x2) / 2 - length / 2;
		const cy = (y1 + y2) / 2 - THICKNESS / 2;
		// angle
		const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

		lineProperties = {
			thickness: THICKNESS,
			left: cx,
			top: cy,
			width: length,
			angle,
		};
	}

	function connect(node: HTMLElement, rootEl: HTMLElement) {
		// TODO: Investigate replacing with resizeobserver
		window.addEventListener('resize', () => updateLinePosition(node, rootEl));

		return {
			update(newRootEl: HTMLElement) {
				rootEl = newRootEl;
				updateLinePosition(node, rootEl);
			},
			destroy: () => {
				window.removeEventListener('resize', () =>
					updateLinePosition(node, rootEl)
				);
			},
		};
	}

	function selectFramework() {
		const fn = () => dispatch('select', { framework });

		// TODO
		// if (lastDraggingTime === null) return fn();

		// console.log(+new Date() - +lastDraggingTime);

		// if (+new Date() - +lastDraggingTime > 300) return fn();

		fn();
	}

	onDestroy(() => {
		if (framework) {
			resetFns[framework] = () => {};
		}
	});
</script>

<button
	bind:this={buttonEl}
	use:draggable={{
		position: $draggablePosition,
		onDrag: ({ offsetX, offsetY }) =>
			draggablePosition.set({ x: offsetX, y: offsetY }, { duration: 0 }),
		onDragEnd: () => {
			updateLinePosition(buttonEl, logoEl);
			lastDraggingTime = new Date();
		},
	}}
	use:connect={logoEl}
	on:click={selectFramework}
>
	<span>
		<slot />
	</span>
</button>

{#if logoEl}
	<div
		class="line"
		data-logo-framework-connector
		data-framework={framework}
		style:--top="{lineProperties.top}px"
		style:--left="{lineProperties.left}px"
		style:--length="{lineProperties.width}px"
		style:--thickness="{lineProperties.thickness}px"
		style:--angle="{lineProperties.angle}deg"
		use:portal={'body'}
		in:fade={{ delay: 1000 }}
	/>
{/if}

<style lang="scss">
	button {
		background-color: transparent;

		height: max-content;

		:global(svg) {
			min-width: 3rem;
			width: 3rem;

			transition: transform 0.2s ease;

			&:hover {
				transform: scale(1.2);
			}
		}
	}

	.line {
		position: absolute;
		top: var(--top);
		left: var(--left);

		padding: 0px;
		margin: 0px;

		background-color: hsla(var(--app-color-dark-hsl), 0.5);
		line-height: 1px;

		height: var(--thickness);
		width: var(--length);

		transform: rotate(var(--angle));

		will-change: width;
	}
</style>
