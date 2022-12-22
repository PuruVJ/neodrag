<script lang="ts">
	// TODO: MAKE IT FANCYYCYYYYYYYYYYYY 😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
	import { FRAMEWORKS } from 'src/helpers/constants';
	// @ts-ignore
	import IonReloadIcon from '~icons/ion/reload';

	import FrameworkVertex from './FrameworkVertex.svelte';

	let logoEl: HTMLImageElement;

	let resetFns = {
		svelte: () => {},
		react: () => {},
		vue: () => {},
		solid: () => {},
		vanilla: () => {},
	};

	let zIndices = [0, 0, 0, 0, 0];

	// let frameworks = ['vanilla', 'svelte', 'react', 'vue', 'solid'];
	const frameworks = ['solid', 'vanilla', 'react', 'vue', 'svelte']
		.map((name) => FRAMEWORKS.find((f) => f.name === name)!)!
		.map(({ name }) => ({
			name,
			icon: FRAMEWORK_ICONS[name],
		}));

	/**
	 * This function updates z index of selected element. But if any element has z index of more than 50,
	 * it reduces z index of all of them by the minimum z index of all elements.
	 * @param node
	 */
	function updateZIndex(index: number) {
		zIndices[index] = Math.max(...zIndices) + 1;

		// get the lowest non zero index from the z index array
		const lowestZIndex = zIndices.reduce((acc, curr) => {
			if (curr === 0) return acc;
			return Math.min(acc, curr);
		}, Infinity);

		if (zIndices[index] > zIndices.length) {
			zIndices = zIndices.map((z) =>
				z >= lowestZIndex ? z - lowestZIndex : z
			);
		}
	}
</script>

<section class="container framework-polygon">
	<button
		class="reset"
		on:click={() => Object.values(resetFns).forEach((fn) => fn())}
	>
		<IonReloadIcon />
	</button>

	<section class="animation-frameworks">
		{#each frameworks as { name, icon: Icon }, idx}
			<div style:z-index={zIndices[idx]}>
				<FrameworkVertex
					on:select
					on:drag-start={() => {
						// zIndices[idx] = zIndices.length;
						updateZIndex(idx);
					}}
					bind:resetFns
					framework={name}
					{logoEl}
				>
					<Icon />
				</FrameworkVertex>
			</div>
		{/each}
	</section>

	<img
		bind:this={logoEl}
		src="/logo.svg"
		draggable="false"
		class="logo"
		alt="Neodrag logo"
	/>
</section>

<style lang="scss">
	@mixin on-circle($item-count, $circle-size, $item-size) {
		position: relative;
		width: $circle-size;
		height: $circle-size;
		padding: 0;
		border-radius: 50%;
		list-style: none;

		> * {
			display: block;
			position: absolute;
			top: 50%;
			left: 50%;
			width: $item-size;
			height: $item-size;
			margin: calc(-1 * ($item-size / 2));

			$angle: calc(360 / $item-count);
			$rot: -18;

			@for $i from 1 through $item-count {
				&:nth-of-type(#{$i}) {
					transform: rotate(calc($rot * 1deg))
						translate(calc($circle-size / 2))
						rotate(calc($rot * -1deg));
				}

				$rot: $rot + $angle;
			}
		}
	}

	.container {
		display: grid;
		place-items: center;

		position: relative;
	}

	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 7;

		transform: translate(-50%, -50%);
		width: 7rem;
	}

	.animation-frameworks {
		@include on-circle($item-count: 5, $circle-size: 30rem, $item-size: 3rem);

		display: flex;
		align-items: flex-start;

		// margin: 0 auto;

		font-size: 3rem;
		font-weight: 600;
		font-family: 'Jetbrains Mono', monospace;
	}

	.reset {
		position: absolute;
		right: 8px;
		top: 8px;

		font-size: 1.2rem;

		padding: 0.5rem;

		border-radius: 8px;

		background-color: hsla(var(--app-color-dark-hsl), 0.3);
		backdrop-filter: blur(5px) brightness(50%) grayscale(0.4);

		&:hover :global(svg) {
			transform: rotate(100deg) scale(1.2);
		}

		:global(svg) {
			transition: transform 0.2s ease-in-out;

			color: var(--app-color-dark);
		}
	}
</style>
