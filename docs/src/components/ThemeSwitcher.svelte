<script lang="ts">
	import { theme } from '$state/user-preferences.svelte.ts';
	import {
		axis,
		bounds,
		BoundsFrom,
		createCompartment,
		draggable,
		events,
		position,
	} from '@neodrag/svelte';
	import { IsMounted } from 'runed';
	import { untrack } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import SunnyIcon from '~icons/ion/sunny-outline';
	import MoonIcon from '~icons/ph/moon-fill';

	let container_width = $state(0);

	let draggable_el = $state<HTMLDivElement>();

	const position_x = new Tween(0, { duration: 400, easing: expoOut });
	const position_compartment = createCompartment(() =>
		position({ current: { x: position_x.current, y: 0 } }),
	);

	const mounted = new IsMounted();

	function change_theme() {
		if (position_x.current / container_width >= 0.39) {
			theme.current = 'dark';
		} else {
			theme.current = 'light';
		}
	}

	$effect(() => {
		if (mounted.current && draggable_el)
			untrack(() =>
				position_x.set(
					theme.current === 'dark'
						? container_width - draggable_el!.getBoundingClientRect().width
						: 0,
					{ duration: 0 },
				),
			);
	});
</script>

<div class="theme-switcher" bind:clientWidth={container_width}>
	<button
		class="theme-button light"
		class:selected={theme.current === 'light'}
		data-paw-cursor="true"
		onclick={() => {
			position_x.target = 0;
			change_theme();
		}}
	>
		<SunnyIcon />
	</button>

	<div
		class="draggable"
		data-paw-cursor="true"
		bind:this={draggable_el}
		{@attach draggable(() => [
			axis('x'),
			bounds(BoundsFrom.parent()),
			position_compartment,
			events({
				onDrag: ({ offset }) => {
					position_x.set(offset.x, { duration: 0 });
					change_theme();
				},
				onDragEnd: ({ offset, rootNode }) => {
					if (offset.x / container_width > 0.3) {
						position_x.target = container_width - rootNode.getBoundingClientRect().width;
					} else {
						position_x.target = 0;
					}
					change_theme();
				},
			}),
		])}
	></div>

	<button
		class="theme-button dark"
		class:selected={theme.current === 'dark'}
		data-paw-cursor="true"
		onclick={() => {
			position_x.target = container_width - draggable_el!.getBoundingClientRect().width;
			change_theme();
		}}
	>
		<MoonIcon />
	</button>
</div>

<style>
	.theme-switcher {
		position: relative;
		width: 50%;
		height: 2rem;
		padding: 0;
		border-radius: 24px;
		background-color: color-mix(in lch, var(--secondary-color), transparent 95%);
	}

	.draggable {
		width: 2rem;
		height: 2rem;
		/* // Natural box shadow */
		box-shadow: 0 1px 4px 1px hsla(0, 0%, 13%, 0.3);
		border-radius: 50%;
		background-color: var(--secondary-color);
		z-index: 2;
	}

	.theme-button {
		position: absolute;
		top: 50%;

		transform: translateY(-50%);

		z-index: 2;

		pointer-events: none;

		font-size: 0.8em;
		color: color-mix(in lch, var(--secondary-color), var(--app-color-anti-mixer) 70%);

		padding: 0;

		&.light {
			left: 0.2em;

			&.selected :global(svg) {
				color: var(--app-color-light);
			}
		}

		&.dark {
			right: 0.2em;
		}
	}
</style>
