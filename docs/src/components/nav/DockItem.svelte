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
		base_width * 1.15,
		base_width * 1.55,
		base_width * 2.35,
		base_width * 1.55,
		base_width * 1.15,
		base_width,
	];
</script>

<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import { browser } from '$helpers/utils';
	import { interpolate } from 'popmotion';
	import type { Component } from 'svelte';
	import { prefersReducedMotion, Spring } from 'svelte/motion';

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

	const get_width_from_distance = interpolate(distance_input, width_output);

	const width_px = Spring.of(() => get_width_from_distance(distance), {
		damping: 0.42,
		stiffness: 0.14,
	});

	const is_near = $derived(
		mouse_x !== null && Math.abs(distance) < distance_limit && !prefersReducedMotion.current,
	);

	let raf: number;
	function animate() {
		if (image_el && mouse_x !== null && !prefersReducedMotion.current) {
			const rect = image_el.getBoundingClientRect();
			const img_center_x = rect.left + rect.width / 2;
			distance = mouse_x - img_center_x;
		} else {
			distance = beyond_the_distance_limit;
		}

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
		'group dock-angular-chip relative flex flex-col items-center justify-end gap-1 border-2 border-transparent bg-transparent transition-[border-color,background-color,padding] duration-75',
		embedded ? 'px-2 pt-2 pb-1' : 'px-2 pt-2 pb-1',
		is_near &&
			'border-[color-mix(in_lch,var(--color-brand),transparent_45%)] bg-[color-mix(in_lch,var(--color-brand),transparent_92%)]',
		selected &&
			'border-brand bg-[color-mix(in_lch,var(--color-brand),transparent_88%)]',
	]}
	style:padding-bottom={embedded ? undefined : `${6 + Math.max(0, (width_px.current - base_width) * 0.15)}px`}
>
	{#if !embedded}
		<p
			class={[
				'dock-angular-chip pointer-events-none absolute z-10 border-2 border-[var(--dock-border-strong)] bg-[var(--dock-surface)] px-3 py-1.5 font-mono text-[0.68rem] font-extrabold tracking-[0.14em] text-fg uppercase shadow-[var(--dock-shadow)]',
				is_near ? 'block' : 'hidden group-focus-visible:block',
			]}
			style:top={`${-28 - Math.max(0, (width_px.current - base_width) * 0.35)}px`}
		>
			{framework}
		</p>
	{/if}

	<span
		bind:this={image_el}
		class="flex items-center justify-center will-change-[width,height] text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_path]:!text-current [&_g]:!text-current [&_svg]:!max-w-none [&_svg]:!text-current"
	>
		<Icon
			height={width_px.current}
			width={width_px.current}
			style="width: {width_px.current}px; height: {width_px.current}px; max-width: none;"
		/>
	</span>

	{#if embedded}
		<p
			class="m-0 text-[13px] font-normal tracking-wide text-[color-mix(in_lch,var(--app-color-light-contrast),transparent_20%)] capitalize"
		>
			{framework}
		</p>
	{/if}

	<div
		class="h-[3px] bg-brand transition-opacity duration-100 [clip-path:polygon(0_0,100%_0,calc(100%-2px)_100%,2px_100%)]"
		style="width: {Math.max(18, width_px.current * 0.55)}px; opacity: {selected ? 1 : is_near ? 0.65 : 0}"
	></div>
</button>
