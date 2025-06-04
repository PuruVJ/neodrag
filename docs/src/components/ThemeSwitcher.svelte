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

	import { onMount, untrack } from 'svelte';
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

	let mounted = $state(false);

	function change_theme() {
		const previous_theme = theme.current;

		// Determine new theme BEFORE starting transition
		const new_theme = position_x.current / container_width >= 0.39 ? 'dark' : 'light';

		// Don't transition if theme hasn't changed
		if (previous_theme === new_theme) return;

		// Ensure current state is stable before transition
		requestAnimationFrame(() => {
			if (document.startViewTransition) {
				document.startViewTransition(() => {
					// Only update state inside the callback
					theme.current = new_theme;
					apply_theme_to_dom(new_theme);
				});
			} else {
				// Fallback for browsers without view transitions
				theme.current = new_theme;
				apply_theme_to_dom(new_theme);
			}
		});
	}

	function apply_theme_to_dom(new_theme: string) {
		document.body.classList.remove('light', 'dark');
		document.body.classList.add(new_theme);
	}

	$effect(() => {
		if (mounted && draggable_el)
			untrack(() =>
				position_x.set(
					theme.current === 'dark'
						? container_width - draggable_el!.getBoundingClientRect().width
						: 0,
					{ duration: 0 },
				),
			);
	});

	onMount(() => {
		mounted = true;
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

	:global {
		/* Improved view transition animations */
		::view-transition-old(root),
		::view-transition-new(root) {
			animation-duration: 0.5s;
			animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		}

		::view-transition-old(root) {
			animation-name: theme-fade-out;
		}

		::view-transition-new(root) {
			animation-name: theme-fade-in;
		}

		@keyframes theme-fade-out {
			0% {
				opacity: 1;
			}
			100% {
				opacity: 0;
			}
		}

		@keyframes theme-fade-in {
			0% {
				opacity: 0;
			}
			100% {
				opacity: 1;
			}
		}

		/* Ensure smooth transitions for reduced motion users */
		@media (prefers-reduced-motion: reduce) {
			::view-transition-old(root),
			::view-transition-new(root) {
				animation-duration: 0.1s !important;
				animation-name: simple-fade !important;
			}
		}

		@keyframes simple-fade {
			to {
				opacity: 0;
			}
		}
	}
</style>
