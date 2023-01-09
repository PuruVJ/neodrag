<script lang="ts">
	//@ts-ignore
	import SunnyIcon from '~icons/ion/sunny-outline';
	// @ts-ignore
	import MoonIcon from '~icons/ph/moon-fill';

	import { draggable } from '@neodrag/svelte';
	import { expoOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	import { mounted } from '$stores/mounted.store';
	import { theme } from '$stores/user-preferences.store';

	let containerWidth = 0;
	let themeSwitcherContainer: HTMLButtonElement;

	let draggableEl: HTMLDivElement;

	const positionX = tweened(0, { duration: 400, easing: expoOut });

	function changeTheme() {
		if ($positionX / containerWidth >= 0.5) {
			$theme = 'dark';
		} else {
			$theme = 'light';
		}
	}

	$: {
		if ($mounted)
			$positionX =
				$theme === 'dark'
					? containerWidth - draggableEl.getBoundingClientRect().width
					: 0;
	}
</script>

<button
	class="theme-switcher"
	on:pointerdown={(e) => {
		const { clientX } = e;

		// Get difference
		$positionX =
			clientX -
			themeSwitcherContainer.getBoundingClientRect().left -
			draggableEl.getBoundingClientRect().width / 2;

		if ($positionX / containerWidth >= 0.5) {
			$positionX = containerWidth - draggableEl.getBoundingClientRect().width;
		} else {
			$positionX = 0;
		}

		changeTheme();
	}}
	bind:clientWidth={containerWidth}
	bind:this={themeSwitcherContainer}
>
	<button
		class="theme-button light"
		class:selected={$theme === 'light'}
		data-paw-cursor="true"
		on:click={() => {
			$positionX = 0;
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
			position: { x: $positionX, y: 0 },
			onDrag: ({ offsetX }) => {
				positionX.set(offsetX, { duration: 0 });
				changeTheme();
			},
			onDragEnd: ({ offsetX, rootNode }) => {
				if (offsetX / containerWidth > 0.3) {
					$positionX = containerWidth - rootNode.getBoundingClientRect().width;
				} else {
					$positionX = 0;
				}

				changeTheme();
			},
		}}
	/>

	<button
		class="theme-button dark"
		class:selected={$theme === 'dark'}
		data-paw-cursor="true"
		on:click={() => {
			$positionX = containerWidth - draggableEl.getBoundingClientRect().width;
			changeTheme();
		}}
	>
		<MoonIcon />
	</button>
</button>

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
