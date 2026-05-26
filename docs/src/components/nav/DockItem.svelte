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

	const icon_scale = $derived(width_px.current / base_width);

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
	<div
		class={[
			'group dock-angular-bevel dock-angular-bevel--sm relative h-14 shrink-0 overflow-visible',
			(is_near || selected) && 'dock-angular-bevel--brand',
		]}
	>
		<button
			aria-label="Launch {framework} page"
			class="dock-angular-bevel__fill relative flex h-14 max-h-14 min-h-14 w-full flex-col items-center justify-end gap-1 overflow-visible bg-transparent px-2 pb-1"
		>
			{#if !embedded}
				<div
					class={[
						'dock-angular-bevel dock-angular-bevel--sm pointer-events-none absolute z-10 shadow-[var(--dock-shadow)]',
						is_near ? 'block' : 'hidden group-focus-visible:block',
					]}
					style:top={`${-32 - Math.max(0, (width_px.current - base_width) * 0.35)}px`}
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
				class="flex size-8 origin-bottom items-end justify-center will-change-transform text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_path]:!text-current [&_g]:!text-current [&_svg]:!max-w-none [&_svg]:!text-current"
				style="transform: scale({icon_scale});"
			>
				<Icon
					height={base_width}
					width={base_width}
					style="width: {base_width}px; height: {base_width}px; max-width: none;"
				/>
			</span>

			<div
				class="h-[3px] transition-opacity duration-100 [clip-path:polygon(0_0,100%_0,calc(100%-2px)_100%,2px_100%)] [background-color:var(--color-brand)]"
				style="width: {Math.max(18, width_px.current * 0.55)}px; opacity: {selected ? 1 : is_near ? 0.65 : 0}"
			></div>
		</button>
	</div>
{/if}
