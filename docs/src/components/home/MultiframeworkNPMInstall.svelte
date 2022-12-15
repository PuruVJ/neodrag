<script lang="ts">
	// TODO: MAKE IT FANCYYCYYYYYYYYYYYY 😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡
	import { FRAMEWORKS } from 'src/helpers/constants';
	import { onMount } from 'svelte';
	import SpinnerItem from './SpinnerItem.svelte';

	// let frameworks = ['vanilla', 'svelte', 'react', 'vue', 'solid'];
	let frameworks = ['react', 'vue', 'svelte', 'solid', 'vanilla'].map(
		(name) => FRAMEWORKS.find((f) => f.name === name)!
	)!;

	let spinnerHeight = 0;
	let theta = (2 * Math.PI) / 3;
	$: radius =
		spinnerHeight === 0 ? 0 : spinnerHeight / (2 * Math.sin(theta / 2));

	let mouseY: number | null = null;
</script>

<section class="animation-frameworks">
	<span class="prefix"> pnpm add @neodrag/ </span>
	<ul
		class="spinner"
		bind:clientHeight={spinnerHeight}
		on:mousemove={(e) => (mouseY = e.clientY)}
		on:mouseleave={() => (mouseY = null)}
	>
		{#each frameworks as { name }, idx}
			<li style:color="var(--app-color-brand-{name})" class="framework">
				<SpinnerItem {spinnerHeight} frameworkName={name} {mouseY} />
			</li>
		{/each}
	</ul>
</section>

<style lang="scss">
	.animation-frameworks {
		display: flex;
		align-items: flex-start;

		margin: 0 auto;
		padding: 0 1rem;
		font-size: 3rem;
		font-weight: 600;
		font-family: 'Jetbrains Mono', monospace;
	}

	.spinner {
		display: flex;
		flex-direction: column;
		gap: 0rem;

		list-style-type: none;

		padding: 0;

		font-size: inherit;

		width: 40%;
	}

	.framework {
		transform-origin: left;
	}
</style>
