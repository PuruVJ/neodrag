<script lang="ts">
	import { portal } from '$actions/portal';
	import { draggable, type DragEventData } from '@neodrag/svelte';
	import type { Framework } from '$helpers/constants';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { untrack } from 'svelte';

	type Props = {
		logoEl: HTMLImageElement;
		framework: Framework;
		resetFns: Record<Framework, () => void>;
		children?: import('svelte').Snippet;

		// Events
		onselect?: (data: { framework: Framework }) => void;
		on_drag_start?: (data: DragEventData) => void;
		on_drag?: (data: DragEventData) => void;
		on_drag_end?: (data: DragEventData) => void;
	};

	let {
		logoEl,
		framework,
		resetFns = $bindable(),
		children,

		on_drag,
		on_drag_end,
		on_drag_start,
		onselect,
	}: Props = $props();

	const reset = () => {
		draggable_position.target = { x: 0, y: 0 };
	};

	let button_el = $state<HTMLButtonElement>();

	let line_properties = $state({
		thickness: 2,
		left: 0,
		top: 0,
		width: 0,
		angle: 0,
	});

	let draggable_position = new Tween({ x: 0, y: 0 }, { easing: expoOut, duration: 1200 });

	function get_offset(el: HTMLElement) {
		const rect = el.getBoundingClientRect();

		return {
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY,
			width: rect.width || el.offsetWidth,
			height: rect.height || el.offsetHeight,
		};
	}

	const THICKNESS = 2;

	function update_line_position(node: HTMLElement, rootEl: HTMLElement) {
		if (!rootEl) return;

		const root_rect = get_offset(rootEl);
		const node_rect = get_offset(node);

		const x1 = root_rect.left + root_rect.width / 2;
		const y1 = root_rect.top + root_rect.height / 2;
		// top right
		const x2 = node_rect.left + node_rect.width / 2;
		const y2 = node_rect.top + node_rect.height / 2;
		// distance
		const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

		const cx = (x1 + x2) / 2 - length / 2;
		const cy = (y1 + y2) / 2 - THICKNESS / 2;
		// angle
		const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

		line_properties = {
			thickness: THICKNESS,
			left: cx,
			top: cy,
			width: length,
			angle,
		};
	}

	function connect(node: HTMLElement, root_el: HTMLElement) {
		// TODO: Investigate replacing with resizeobserver
		window.addEventListener('resize', () => update_line_position(node, root_el));

		return {
			update(newRootEl: HTMLElement) {
				root_el = newRootEl;
				update_line_position(node, root_el);
			},
			destroy: () => {
				window.removeEventListener('resize', () => update_line_position(node, root_el));
			},
		};
	}

	function selectFramework() {
		const fn = () => onselect?.({ framework });

		// TODO
		// if (lastDraggingTime === null) return fn();

		// console.log(+new Date() - +lastDraggingTime);

		// if (+new Date() - +lastDraggingTime > 300) return fn();

		fn();
	}

	$effect(() => {
		if (framework) {
			resetFns[framework] = reset;
		}

		return () => {
			resetFns[framework] = () => {};
		};
	});

	$effect(() => {
		draggable_position.current;

		if (button_el && logoEl) untrack(() => update_line_position(button_el!, logoEl));
	});
</script>

<button
	data-paw-cursor="true"
	bind:this={button_el}
	use:draggable={{
		position: draggable_position.current,
		onDragStart: (data) => {
			on_drag_start?.(data);
		},
		onDrag: (data) => {
			on_drag?.(data);
			draggable_position.set({ x: data.offsetX, y: data.offsetY }, { duration: 0 });
		},
		onDragEnd: (data) => {
			on_drag_end?.(data);
			update_line_position(button_el!, logoEl);
		},
	}}
	use:connect={logoEl}
	onclick={selectFramework}
>
	<span>
		{@render children?.()}
	</span>
</button>

{#if logoEl}
	<div
		class="line"
		data-logo-framework-connector
		data-framework={framework}
		style:--top="{line_properties.top}px"
		style:--left="{line_properties.left}px"
		style:--length="{line_properties.width}px"
		style:--thickness="{line_properties.thickness}px"
		style:--angle="{line_properties.angle}deg"
		use:portal={'body'}
		in:fade={{ delay: 1000 }}
	></div>
{/if}

<style lang="scss">
	button {
		background-color: transparent;

		height: max-content;

		:global(svg) {
			min-width: clamp(2rem, 5vw, 2.5rem);

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
