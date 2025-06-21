<script lang="ts">
	import { portal } from '$attachments/portal.svelte';
	import type { Framework } from '$helpers/constants';
	import { Compartment, draggable, events, position, type DragEventData } from '@neodrag/svelte';
	import type { Attachment } from 'svelte/attachments';
	import { expoOut } from 'svelte/easing';
	import { on } from 'svelte/events';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';

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

	const position_compartment = Compartment.of(() =>
		position({ current: draggable_position.current }),
	);

	// Cache for element positions to avoid repeated getBoundingClientRect calls
	let cached_positions = {
		logo: { left: 0, top: 0, width: 0, height: 0, timestamp: 0 },
		button: { left: 0, top: 0, width: 0, height: 0, timestamp: 0 },
	};

	// FIXED: Event-driven RAF instead of continuous loop
	let needs_position_update = true;
	let is_dragging = false;
	let raf_id: number | null = null;

	const CACHE_DURATION = 16; // ~1 frame at 60fps
	const THICKNESS = 2;

	function get_cached_offset(el: HTMLElement, cache_key: 'logo' | 'button') {
		const now = performance.now();
		const cached = cached_positions[cache_key];

		// Return cached position if it's recent and we don't need an update
		if (!needs_position_update && now - cached.timestamp < CACHE_DURATION) {
			return cached;
		}

		// Recalculate and cache
		const rect = el.getBoundingClientRect();
		const position = {
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY,
			width: rect.width || el.offsetWidth,
			height: rect.height || el.offsetHeight,
			timestamp: now,
		};

		cached_positions[cache_key] = position;
		return position;
	}

	function calculate_line_properties() {
		if (!button_el || !logoEl) return;

		const root_rect = get_cached_offset(logoEl, 'logo');
		const node_rect = get_cached_offset(button_el, 'button');

		const x1 = root_rect.left + root_rect.width / 2;
		const y1 = root_rect.top + root_rect.height / 2;
		const x2 = node_rect.left + node_rect.width / 2;
		const y2 = node_rect.top + node_rect.height / 2;

		const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		const cx = (x1 + x2) / 2 - length / 2;
		const cy = (y1 + y2) / 2 - THICKNESS / 2;
		const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

		line_properties = {
			thickness: THICKNESS,
			left: cx,
			top: cy,
			width: length,
			angle,
		};
	}

	// FIXED: Only RAF when needed - this prevents Chrome Android interference
	function schedule_raf_update() {
		if (raf_id !== null) return; // Already scheduled

		raf_id = requestAnimationFrame(() => {
			// Only update if dragging or if we explicitly need an update
			if (is_dragging || needs_position_update) {
				calculate_line_properties();
				needs_position_update = false;
			}

			raf_id = null;

			// Continue the loop ONLY while dragging
			if (is_dragging) {
				schedule_raf_update();
			}
		});
	}

	function mark_for_update() {
		needs_position_update = true;
		schedule_raf_update();
	}

	function invalidate_cache() {
		cached_positions.logo.timestamp = 0;
		cached_positions.button.timestamp = 0;
		mark_for_update();
	}

	const connect =
		(root_el: HTMLElement): Attachment =>
		(_node) => {
			const unsub = on(window, 'resize', invalidate_cache);

			$effect(() => {
				root_el;
				mark_for_update();
			});

			return unsub;
		};

	function selectFramework() {
		const fn = () => onselect?.({ framework });
		fn();
	}

	// Lifecycle management
	$effect(() => {
		if (framework) {
			resetFns[framework] = reset;
		}

		return () => {
			resetFns[framework] = () => {};
			// FIXED: Clean up RAF on destroy
			if (raf_id !== null) {
				cancelAnimationFrame(raf_id);
				raf_id = null;
			}
		};
	});

	// Start RAF loop when elements are available
	$effect(() => {
		if (button_el && logoEl) {
			mark_for_update();
		}
	});

	$effect(() => {
		draggable_position.current;
		// Mark for update when position changes
		mark_for_update();
	});
</script>

<button
	data-paw-cursor="true"
	bind:this={button_el}
	{@attach draggable(() => [
		position_compartment,
		events({
			onDragStart: (data) => {
				// FIXED: Start continuous RAF only when dragging starts
				is_dragging = true;
				invalidate_cache();
				on_drag_start?.(data);
			},
			onDrag: (data) => {
				on_drag?.(data);
				draggable_position.set({ x: data.offset.x, y: data.offset.y }, { duration: 0 });
				// Position will be updated smoothly by RAF loop
			},
			onDragEnd: (data) => {
				// FIXED: Stop continuous RAF when dragging ends
				is_dragging = false;
				invalidate_cache();
				on_drag_end?.(data);
			},
		}),
	])}
	{@attach connect(logoEl)}
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
		{@attach portal('body')}
		in:fade={{ delay: 1000 }}
	></div>
{/if}

<style>
	button {
		background-color: transparent;
		height: max-content;

		/* FIXED: Add touch optimizations for Chrome Android */
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;

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
		background-color: color-mix(in lch, var(--app-color-dark), transparent 50%);
		line-height: 1px;
		height: var(--thickness);
		width: var(--length);
		transform: rotate(var(--angle));
		will-change: width;

		/* FIXED: Add GPU acceleration hints */
		transform-style: preserve-3d;
		backface-visibility: hidden;
	}
</style>
