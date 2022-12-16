<script lang="ts">
	import type { Framework } from 'src/helpers/constants';
	import { interpolate } from 'popmotion';
	import { spring } from 'svelte/motion';
	import { onDestroy } from 'svelte';

	export let spinnerHeight: number;

	export let mouseY: number | null = null;

	export let frameworkName: Framework;

	let buttonEl: HTMLButtonElement;

	const fontWeightOutput = [100, 300, 900, 300, 100];

	$: distanceLimit = spinnerHeight / 2;
	$: beyondTheDistanceLimit = distanceLimit + 1;
	$: distanceInput = [
		-distanceLimit,
		-distanceLimit / 2,
		0,
		distanceLimit / 2,
		distanceLimit,
	];

	let distance = beyondTheDistanceLimit;

	const fontWeight = spring(200, {
		damping: 0.47,
		stiffness: 0.12,
	});

	$: getFontSizeFromDistance = interpolate(distanceInput, fontWeightOutput);
	$: $fontWeight = mouseY === null ? 200 : getFontSizeFromDistance(distance);

	let raf: number;
	function animate() {
		if (buttonEl && mouseY !== null) {
			const rect = buttonEl.getBoundingClientRect();

			// get the x coordinate of the img DOMElement's center
			// the left x coordinate plus the half of the width
			const imgCenterY = rect.top + rect.height / 2;

			// difference between the x coordinate value of the mouse pointer
			// and the img center x coordinate value
			const distanceDelta = mouseY - imgCenterY;
			distance = distanceDelta;
			return;
		}

		distance = beyondTheDistanceLimit;
	}

	$: {
		mouseY;

		raf = requestAnimationFrame(animate);
	}

	onDestroy(() => {
		cancelAnimationFrame(raf);
	});
</script>

<button
	style:--font-weight={$fontWeight}
	style:color="var(--app-color-brand-{frameworkName})"
	bind:this={buttonEl}
>
	{frameworkName}
</button>

<style lang="scss">
	button {
		background-color: transparent;

		// font-size: calc(1rem * var(--font-size));
		font-weight: var(--font-weight);

		font-family: 'JetBrains MonoVariable', monospace;

		transform: translateX(0) translateZ(0);
	}
</style>
