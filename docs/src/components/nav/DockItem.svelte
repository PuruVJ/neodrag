<script module>
	const base_width = 32;
	const distance_limit = base_width * 6;
	const beyond_the_distance_limit = distance_limit + 1;
	const distance_input = [
		-distance_limit,
		-distance_limit / 1.25,
		-distance_limit / 2,
		0,
		distance_limit / 2,
		distance_limit / 1.25,
		distance_limit,
	];
	const width_output = [
		base_width,
		base_width * 1.1,
		base_width * 1.414,
		base_width * 2,
		base_width * 1.414,
		base_width * 1.1,
		base_width,
	];
</script>

<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import { browser } from '$helpers/utils';
	import { theme } from '$state/user-preferences.svelte';
	import { interpolate } from 'popmotion';
	import type { Component } from 'svelte';
	import { sineInOut } from 'svelte/easing';
	import { prefersReducedMotion, Spring, Tween } from 'svelte/motion';

	type Props = {
		framework: Framework;
		mouse_x: number | null;
		selected: boolean;
		Icon: Component;
		embedded?: boolean;
	};

	const { framework, mouse_x, selected, Icon, embedded }: Props = $props();

	let image_el: HTMLElement;
	let distance = $state(beyond_the_distance_limit);

	const get_width_from_distance = interpolate(
		distance_input,
		width_output.map((v) => v * 1),
	);

	const width_px = Spring.of(() => get_width_from_distance(distance), {
		damping: 0.47,
		stiffness: 0.12,
	});

	const app_open_icon_bounce_transform = new Tween(0, {
		duration: 400,
		easing: sineInOut,
	});

	let raf: number;
	function animate() {
		if (image_el && mouse_x !== null && !prefersReducedMotion.current) {
			const rect = image_el.getBoundingClientRect();

			// get the x coordinate of the img DOMElement's center
			// the left x coordinate plus the half of the width
			const img_center_x = rect.left + rect.width / 2;

			// difference between the x coordinate value of the mouse pointer
			// and the img center x coordinate value
			const distance_delta = mouse_x - img_center_x;
			distance = distance_delta;
		} else distance = beyond_the_distance_limit;

		raf = requestAnimationFrame(animate);
	}

	$effect(() => {
		if (!browser) return;
		raf = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(raf);
	});
</script>

<button
	aria-label="Launch {framework} page"
	class={['dock-open-app-button', selected && 'is-selected']}
>
	{#if !embedded}
		<p
			class={['tooltip', theme.current === 'dark' && 'dark']}
			style:top={prefersReducedMotion.current ? '-50px' : '-35%'}
		>
			{framework}
		</p>
	{/if}

	<span
		bind:this={image_el}
		style:translate="0 {app_open_icon_bounce_transform.current} 0.0000001px"
	>
		<Icon
			height={width_px.current}
			width={width_px.current}
			style="width: {width_px.current}px; height: {width_px.current}px"
		/>
	</span>

	{#if embedded}
		<p class="embedded-text">{framework}</p>
	{/if}

	<div class="dot" style:--opacity={selected ? 1 : 0}></div>
</button>

<style>
	button span {
		color: color-mix(in lch, var(--app-color-dark), transparent 25%) !important;
	}

	span {
		:global {
			svg {
				will-change: width;

				&,
				g,
				path {
					color: currentColor !important;
				}
			}
		}
	}

	button {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		gap: 0.2rem;
		position: relative;

		padding: 0.7rem 0.75rem 6px;
		border: 2px solid transparent;
		background: transparent;
		clip-path: polygon(
			var(--dock-cut-sm) 0%,
			calc(100% - var(--dock-cut-sm)) 0%,
			100% var(--dock-cut-sm),
			100% calc(100% - var(--dock-cut-sm)),
			calc(100% - var(--dock-cut-sm)) 100%,
			var(--dock-cut-sm) 100%,
			0% calc(100% - var(--dock-cut-sm)),
			0% var(--dock-cut-sm)
		);
		transition:
			border-color 75ms ease,
			background-color 75ms ease;

		&:hover,
		&:focus-visible {
			border-color: color-mix(in lch, var(--app-color-primary), transparent 50%);
			background: color-mix(in lch, var(--app-color-primary), transparent 92%);

			.tooltip {
				display: block;
			}
		}

		& > span {
			display: flex;
			justify-content: center;
			align-items: center;
		}
	}

	button.is-selected {
		border-color: var(--app-color-primary);
		background: color-mix(in lch, var(--app-color-primary), transparent 88%);
	}

	.embedded-text {
		color: color-mix(in lch, var(--app-color-light-contrast), transparent 20%);
		/* font-family: var(--system-font-family); */
		font-weight: 400;
		font-size: 13px;
		letter-spacing: 0.4px;
		margin: 0;
	}

	.tooltip {
		white-space: nowrap;
		line-height: 1;
		position: absolute;
		background-color: var(--dock-surface-strong);
		padding: 0.45rem 0.75rem;
		border: 2px solid var(--dock-border-strong);
		box-shadow: var(--dock-shadow);
		color: var(--app-color-dark);
		font-family: var(--app-font-mono);
		font-weight: 800;
		font-size: 0.68rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		display: none;
		clip-path: polygon(
			0.35rem 0%,
			calc(100% - 0.35rem) 0%,
			100% 0.35rem,
			100% calc(100% - 0.35rem),
			calc(100% - 0.35rem) 100%,
			0.35rem 100%,
			0% calc(100% - 0.35rem),
			0% 0.35rem
		);
	}

	.dot {
		height: 3px;
		width: 1.1rem;
		margin: 0;
		border-radius: 0;
		background-color: var(--app-color-primary);
		opacity: var(--opacity);
		clip-path: polygon(0 0, 100% 0, calc(100% - 2px) 100%, 2px 100%);
	}
</style>
