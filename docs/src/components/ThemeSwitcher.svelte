<script lang="ts">
	//@ts-ignore
	import SunnyIcon from '~icons/ion/sunny-outline';
	// @ts-ignore
	import MoonIcon from '~icons/ph/moon-fill';

	import { draggable } from '@neodrag/svelte';
	import { expoOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	import { theme } from '$stores/user-preferences.store';
	import { mounted } from '$stores/mounted.store';
	import { onMount } from 'svelte';

	let containerWidth = 0;

	let draggableEl: HTMLDivElement;

	const positionX = tweened(0, { duration: 400, easing: expoOut });

	function changeTheme() {
		if ($positionX / containerWidth > 0.5) {
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
	on:click={() => {
		$positionX = 0;
		changeTheme();
	}}
>
	<SunnyIcon />
</button>

<button class="theme-switcher" bind:clientWidth={containerWidth}>
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
			},
			onDragEnd: ({ offsetX, node }) => {
				if (offsetX / containerWidth > 0.3) {
					$positionX = containerWidth - node.getBoundingClientRect().width;
				} else {
					$positionX = 0;
				}

				changeTheme();
			},
		}}
	/>
</button>

<button
	on:click={() => {
		$positionX = containerWidth - draggableEl.getBoundingClientRect().width;
		changeTheme();
	}}
>
	<MoonIcon />
</button>

<style lang="scss">
	.theme-switcher {
		width: 40%;
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
</style>
