<script lang="ts">
	// TODO: MAKE IT FANCYYCYYYYYYYYYYYY 😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡
	import { FRAMEWORKS } from 'src/helpers/constants';
	import { selectedFramework } from '$stores/user-preferences.store';

	// let frameworks = ['vanilla', 'svelte', 'react', 'vue', 'solid'];
	let frameworks = [...FRAMEWORKS];

	// const baseFontSize = 1;

	// const fontSizeOutput = [
	// 	baseFontSize,
	// 	baseFontSize * 1.1,
	// 	baseFontSize * 1.414,
	// 	baseFontSize * 2,
	// 	baseFontSize * 1.414,
	// 	baseFontSize * 1.1,
	// 	baseFontSize,
	// ];
</script>

<section class="animation-frameworks">
	<span class="prefix"> pnpm add @neodrag/ </span>
	<ul class="spinner">
		{#each frameworks as { name }}
			<li style:color="var(--app-color-brand-{name})" class="framework">
				<button on:click={() => ($selectedFramework = name)}>{name}</button>
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
	}

	.framework {
		transform-origin: left;
	}
</style>
