<script lang="ts">
	import { FRAMEWORKS } from '$helpers/constants';
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
	import IonReloadIcon from '~icons/ion/reload';
	import FrameworkVertex from './FrameworkVertex.svelte';
	import type { Framework } from '$helpers/constants';

	type Props = {
		onselect: (data: { framework: Framework }) => void;
	};

	const { onselect }: Props = $props();

	let logo_el = $state<HTMLImageElement>();

	let reset_fns = $state({
		svelte: () => {},
		react: () => {},
		vue: () => {},
		solid: () => {},
		vanilla: () => {},
	});

	let z_indices = $state([0, 0, 0, 0, 0]);

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
	function update_z_index(index: number) {
		z_indices[index] = Math.max(...z_indices) + 1;

		// get the lowest non zero index from the z index array
		const lowest_z_index = z_indices.reduce((acc, curr) => {
			if (curr === 0) return acc;
			return Math.min(acc, curr);
		}, Infinity);

		if (z_indices[index] > z_indices.length) {
			z_indices = z_indices.map((z) =>
				z >= lowest_z_index ? z - lowest_z_index : z,
			);
		}
	}
</script>

<section class="container framework-polygon">
	<button
		class="reset"
		onclick={() => Object.values(reset_fns).forEach((fn) => fn())}
	>
		<IonReloadIcon />
	</button>

	<section class="animation-frameworks">
		{#each frameworks as { name, icon: Icon }, idx}
			<div style:z-index={z_indices[idx]}>
				<FrameworkVertex
					{onselect}
					on_drag_start={() => {
						update_z_index(idx);
					}}
					bind:resetFns={reset_fns}
					framework={name}
					logoEl={logo_el!}
				>
					<Icon />
				</FrameworkVertex>
			</div>
		{/each}
	</section>

	<img
		bind:this={logo_el}
		src="/logo.svg"
		draggable="false"
		class="logo"
		alt="Neodrag logo"
	/>
</section>

<style lang="scss">
	@import '../../../../css/breakpoints';

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

		@include media('>tablet') {
			padding: 0 6rem;
		}

		position: relative;
	}

	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 7;

		transform: translate(-50%, -50%);

		width: clamp(4rem, 20vw, 7rem);
	}

	.animation-frameworks {
		@include on-circle($item-count: 5, $circle-size: 30rem, $item-size: 3rem);

		@include media('<sm-tablet') {
			@include on-circle($item-count: 5, $circle-size: 20rem, $item-size: 2rem);
		}

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
		z-index: 20;

		font-size: 1.2rem;

		padding: 0.5rem;

		border-radius: 8px;

		background-color: hsla(var(--app-color-dark-hsl), 0.3);
		backdrop-filter: blur(5px);

		&:hover :global(svg) {
			transform: rotate(100deg) scale(1.2);
		}

		:global(svg) {
			transition: transform 0.2s ease-in-out;

			color: var(--app-color-dark);
		}
	}
</style>
