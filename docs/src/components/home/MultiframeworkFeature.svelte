<script lang="ts">
	// TODO: MAKE IT FANCYYCYYYYYYYYYYYY 😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡
	import { FRAMEWORKS } from 'src/helpers/constants';
	import SpinnerItem from './SpinnerItem.svelte';

	// let frameworks = ['vanilla', 'svelte', 'react', 'vue', 'solid'];
	let frameworks = ['react', 'vue', 'svelte', 'solid', 'vanilla'].map(
		(name) => FRAMEWORKS.find((f) => f.name === name)!
	)!;

	const baseAngle = (2 * Math.PI) / frameworks.length;
</script>

<section class="animation-frameworks">
	{#each frameworks as { name }}
		<button>
			<img src="/framework-logos/{name}.svg" alt="{name} logo" />
		</button>
	{/each}
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
