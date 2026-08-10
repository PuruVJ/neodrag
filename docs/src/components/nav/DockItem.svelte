<script module>
	const base_width = 32;
	const slot_padding_x = 16;
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

	const slot_width = $derived(
		Math.max(base_width + slot_padding_x, width_px.current + slot_padding_x),
	);

	const focus_limit = base_width * 0.85;

	const is_focused = $derived(
		mouse_x !== null && Math.abs(distance) < focus_limit && !prefersReducedMotion.current,
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

{#if embedded}
	<span
		class={[
			'dock-framework-embedded relative flex w-full min-h-[3.5rem] flex-col items-center justify-center gap-1 px-1 pb-2 pt-2',
			selected && 'is-selected',
		]}
	>
		{#if selected}
			<span
				class="dock-bevel dock-bevel-sm dock-bevel-brand pointer-events-none absolute inset-0"
				aria-hidden="true"
			>
				<span class="dock-bevel-fill block h-full w-full"></span>
			</span>
		{/if}
		<span class="relative z-[1] flex w-full flex-col items-center justify-center gap-1">
			<span
				class={[
					'flex size-5 shrink-0 items-center justify-center [&_svg]:m-auto [&_path]:!text-current [&_g]:!text-current [&_svg]:!block [&_svg]:!size-5',
					selected
						? 'text-[var(--chip-label,var(--color-brand))]'
						: 'text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)]',
				]}
			>
				<Icon height={20} width={20} />
			</span>
			<span
				class={[
					'font-mono text-[0.68rem] capitalize leading-none',
					selected
						? 'font-extrabold text-[var(--chip-label,var(--color-brand))]'
						: 'font-semibold text-[color-mix(in_lch,var(--app-color-dark),transparent_28%)]',
				]}
			>{framework}</span>
		</span>
		<span
			class={[
				'absolute bottom-0 left-1/2 z-[2] h-[3px] -translate-x-1/2 transition-opacity duration-100 [clip-path:polygon(0_0,100%_0,calc(100%-2px)_100%,2px_100%)] [background-color:var(--color-brand)]',
				selected ? 'w-[55%] opacity-100' : 'w-[40%] opacity-0',
			]}
			aria-hidden="true"
		></span>
	</span>
{:else}
	<div class="group relative h-14 shrink-0 overflow-visible" style:width="{slot_width}px">
		<button
			aria-label="Launch {framework} page"
			class="relative h-14 min-h-14 w-full overflow-visible bg-transparent"
		>
			<span
				bind:this={image_el}
				class={[
					'absolute bottom-3 left-1/2 z-[2] flex -translate-x-1/2 origin-bottom will-change-[width,height] [&_path]:!text-current [&_g]:!text-current [&_svg]:!max-w-none [&_svg]:!origin-bottom [&_svg]:!text-current',
					selected
						? 'text-brand'
						: 'text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)]',
				]}
			>
				{#if !embedded}
					<div
						class={[
							'dock-tooltip pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap',
							is_focused ? 'block' : 'hidden group-focus-visible:block',
						]}
						aria-hidden="true"
					>
						<p class="dock-tooltip-label m-0 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.06em] capitalize">
							{framework}
						</p>
					</div>
				{/if}

				<Icon
					height={width_px.current}
					width={width_px.current}
					style="width: {width_px.current}px; height: {width_px.current}px; max-width: none; transform-origin: bottom center;"
				/>
			</span>

			<div
				class="absolute bottom-0 left-1/2 z-[1] h-[3px] -translate-x-1/2 transition-opacity duration-100 [clip-path:polygon(0_0,100%_0,calc(100%-2px)_100%,2px_100%)] [background-color:var(--color-brand)]"
				style="width: {Math.max(18, width_px.current * 0.55)}px; opacity: {is_focused
					? 0.65
					: selected
						? 1
						: 0}"
			></div>
		</button>
	</div>
{/if}
