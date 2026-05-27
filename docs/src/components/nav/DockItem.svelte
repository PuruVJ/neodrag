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

	const slot_width = $derived(Math.max(base_width + slot_padding_x, width_px.current + slot_padding_x));

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
	<button
		aria-label="Launch {framework} page"
		class="dock-mobile-framework unstyled relative flex w-full flex-col items-center justify-center gap-1 bg-transparent px-2 py-2"
	>
		<span
			class={[
				'flex items-center justify-center text-[1.35rem] [&_path]:!text-current [&_g]:!text-current [&_svg]:!text-current',
				selected
					? 'text-brand'
					: 'text-[color-mix(in_lch,var(--app-color-dark),transparent_28%)]',
			]}
		>
			<Icon height={28} width={28} />
		</span>
		<p class="m-0 text-[13px] font-normal tracking-wide capitalize text-fg-muted">{framework}</p>
	</button>
{:else}
	<div class="group relative h-14 shrink-0 overflow-visible" style:width="{slot_width}px">
		<button
			aria-label="Launch {framework} page"
			class="relative flex h-14 min-h-14 w-full flex-col items-center justify-end overflow-visible bg-transparent px-2 pb-3"
		>
			{#if !embedded}
				<div
					class={[
						'dock-angular-bevel dock-angular-bevel--sm pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 shadow-[var(--dock-shadow)]',
						is_focused ? 'block' : 'hidden group-focus-visible:block',
					]}
				>
					<p
						class="dock-angular-bevel__fill m-0 px-3 py-1.5 font-mono text-[0.68rem] font-extrabold tracking-[0.14em] text-fg uppercase"
					>
						{framework}
					</p>
				</div>
			{/if}

			<span
				bind:this={image_el}
				class={[
					'relative z-[2] flex origin-bottom items-center justify-center will-change-[width,height] [&_path]:!text-current [&_g]:!text-current [&_svg]:!max-w-none [&_svg]:!text-current',
					selected
						? 'text-brand'
						: 'text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)]',
				]}
			>
				<Icon
					height={width_px.current}
					width={width_px.current}
					style="width: {width_px.current}px; height: {width_px.current}px; max-width: none;"
				/>
			</span>

			<div
				class="absolute bottom-0 left-1/2 z-[1] h-[3px] -translate-x-1/2 transition-opacity duration-100 [clip-path:polygon(0_0,100%_0,calc(100%-2px)_100%,2px_100%)] [background-color:var(--color-brand)]"
				style="width: {Math.max(18, width_px.current * 0.55)}px; opacity: {is_focused ? 0.65 : selected ? 1 : 0}"
			></div>
		</button>
	</div>
{/if}
