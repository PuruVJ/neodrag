<script lang="ts">
	import { theme } from '$state/user-preferences.svelte.ts';
	import { draggable } from '@neodrag/svelte';
	import { IsMounted } from 'runed';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import SunnyIcon from '~icons/ion/sunny-outline';
	import MoonIcon from '~icons/ph/moon-fill';

	let containerWidth = $state(0);
	let themeSwitcherContainer = $state<HTMLDivElement>();

	let draggableEl = $state<HTMLDivElement>();

	const positionX = new Tween(0, { duration: 400, easing: expoOut });

	const mounted = new IsMounted();

	function changeTheme() {
		if (positionX.current / containerWidth >= 0.5) {
			theme.current = 'dark';
		} else {
			theme.current = 'light';
		}
	}

	$effect(() => {
		if (mounted.current && draggableEl)
			positionX.target =
				theme.current === 'dark'
					? containerWidth - draggableEl.getBoundingClientRect().width
					: 0;
	});
</script>

<div
	class="theme-switcher"
	onpointerdown={(e) => {
		const { clientX } = e;

		// Get difference
		positionX.target =
			clientX -
			themeSwitcherContainer!.getBoundingClientRect().left -
			draggableEl!.getBoundingClientRect().width / 2;

		if (positionX.current / containerWidth >= 0.5) {
			positionX.target =
				containerWidth - draggableEl!.getBoundingClientRect().width;
		} else {
			positionX.target = 0;
		}

		changeTheme();
	}}
	bind:clientWidth={containerWidth}
	bind:this={themeSwitcherContainer}
>
	<button
		class="theme-button light"
		class:selected={theme.current === 'light'}
		data-paw-cursor="true"
		onclick={() => {
			positionX.target = 0;
			changeTheme();
		}}
	>
		<SunnyIcon />
	</button>

	<div
		class="draggable"
		data-paw-cursor="true"
		bind:this={draggableEl}
		use:draggable={{
			axis: 'x',
			bounds: 'parent',
			position: { x: positionX.current, y: 0 },
			onDrag: ({ offsetX }) => {
				positionX.set(offsetX, { duration: 0 });
				changeTheme();
			},
			onDragEnd: ({ offsetX, rootNode }) => {
				if (offsetX / containerWidth > 0.3) {
					positionX.target =
						containerWidth - rootNode.getBoundingClientRect().width;
				} else {
					positionX.target = 0;
				}

				changeTheme();
			},
		}}
	></div>

	<button
		class="theme-button dark"
		class:selected={theme.current === 'dark'}
		data-paw-cursor="true"
		onclick={() => {
			positionX.target =
				containerWidth - draggableEl!.getBoundingClientRect().width;
			changeTheme();
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
