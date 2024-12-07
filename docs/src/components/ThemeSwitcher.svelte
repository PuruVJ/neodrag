<script lang="ts">
	import { theme } from '$state/user-preferences.svelte.ts';
	import { draggable } from '@neodrag/svelte';
	import { IsMounted } from 'runed';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import SunnyIcon from '~icons/ion/sunny-outline';
	import MoonIcon from '~icons/ph/moon-fill';

	let container_width = $state(0);
	let theme_switcher_container = $state<HTMLDivElement>();

	let draggable_el = $state<HTMLDivElement>();

	const position_x = new Tween(0, { duration: 400, easing: expoOut });

	const mounted = new IsMounted();

	function change_theme() {
		if (position_x.current / container_width >= 0.5) {
			theme.current = 'dark';
		} else {
			theme.current = 'light';
		}
	}

	$effect(() => {
		if (mounted.current && draggable_el)
			position_x.target =
				theme.current === 'dark'
					? container_width - draggable_el.getBoundingClientRect().width
					: 0;
	});
</script>

<div
	class="theme-switcher"
	onpointerdown={(e) => {
		const { clientX } = e;

		// Get difference
		position_x.target =
			clientX -
			theme_switcher_container!.getBoundingClientRect().left -
			draggable_el!.getBoundingClientRect().width / 2;

		if (position_x.current / container_width >= 0.5) {
			position_x.target =
				container_width - draggable_el!.getBoundingClientRect().width;
		} else {
			position_x.target = 0;
		}

		change_theme();
	}}
	bind:clientWidth={container_width}
	bind:this={theme_switcher_container}
>
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
		use:draggable={{
			axis: 'x',
			bounds: 'parent',
			position: { x: position_x.current, y: 0 },
			onDrag: ({ offsetX }) => {
				position_x.set(offsetX, { duration: 0 });
				change_theme();
			},
			onDragEnd: ({ offsetX, rootNode }) => {
				if (offsetX / container_width > 0.3) {
					position_x.target =
						container_width - rootNode.getBoundingClientRect().width;
				} else {
					position_x.target = 0;
				}

				change_theme();
			},
		}}
	></div>

	<button
		class="theme-button dark"
		class:selected={theme.current === 'dark'}
		data-paw-cursor="true"
		onclick={() => {
			position_x.target =
				container_width - draggable_el!.getBoundingClientRect().width;
			change_theme();
		}}
	>
		<MoonIcon />
	</button>
</div>

<style lang="scss">
	.theme-switcher {
		position: relative;

		width: 50%;
		height: 2rem;

		padding: 0;

		border-radius: 24px;

		background-color: hsla(var(--secondary-color-hsl), 0.05);
	}

	.draggable {
		width: 2rem;
		height: 2rem;

		// Natural box shadow
		box-shadow: 0 1px 4px 1px hsla(0, 0%, 13%, 0.3);
		border-radius: 50%;

		background-color: var(--secondary-color);
	}

	.theme-button {
		position: absolute;
		top: 50%;

		transform: translateY(-50%);

		z-index: 2;

		pointer-events: none;

		font-size: 0.8em;
		color: var(--secondary-color-contrast);

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
