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
			const img_center_x = rect.left + rect.width / 2;
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
	class={[
		'group dock-angular-chip relative flex flex-col items-center justify-end gap-1 border-2 border-transparent bg-transparent px-3 pt-3 pb-1.5 transition-[border-color,background-color] duration-75 hover:border-[color-mix(in_lch,var(--color-brand),transparent_50%)] hover:bg-[color-mix(in_lch,var(--color-brand),transparent_92%)]',
		selected &&
			'border-brand bg-[color-mix(in_lch,var(--color-brand),transparent_88%)]',
	]}
>
	{#if !embedded}
		<p
			class="dock-angular-chip pointer-events-none absolute hidden border-2 border-[var(--dock-border-strong)] bg-[var(--dock-surface)] px-3 py-1.5 font-mono text-[0.68rem] font-extrabold tracking-[0.14em] text-fg uppercase shadow-[var(--dock-shadow)] group-hover:block group-focus-visible:block"
			style:top={prefersReducedMotion.current ? '-50px' : '-35%'}
		>
			{framework}
		</p>
	{/if}

	<span
		bind:this={image_el}
		class="flex items-center justify-center text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_path]:!text-current [&_g]:!text-current [&_svg]:!text-current"
		style:translate="0 {app_open_icon_bounce_transform.current} 0.0000001px"
	>
		<Icon
			height={width_px.current}
			width={width_px.current}
			style="width: {width_px.current}px; height: {width_px.current}px"
		/>
	</span>

	{#if embedded}
		<p class="m-0 text-[13px] font-normal tracking-wide text-[color-mix(in_lch,var(--app-color-light-contrast),transparent_20%)] capitalize">
			{framework}
		</p>
	{/if}

	<div
		class="h-[3px] w-[1.1rem] bg-brand opacity-[var(--dot-opacity,0)] [clip-path:polygon(0_0,100%_0,calc(100%-2px)_100%,2px_100%)]"
		style:--dot-opacity={selected ? 1 : 0}
	></div>
</button>
