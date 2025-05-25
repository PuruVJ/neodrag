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
			z_indices = z_indices.map((z) => (z >= lowest_z_index ? z - lowest_z_index : z));
		}
	}
</script>

<section class="container framework-polygon">
	<button class="reset" onclick={() => Object.values(reset_fns).forEach((fn) => fn())}>
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

	<img bind:this={logo_el} src="/logo.svg" draggable="false" class="logo" alt="Neodrag logo" />
</section>

<style>
	.animation-frameworks {
		position: relative;
		width: 30rem;
		height: 30rem;
		padding: 0;
		border-radius: 50%;
		list-style: none;
		display: flex;
		align-items: flex-start;
		/* margin: 0 auto; */
		font-size: 3rem;
		font-weight: 600;
		font-family: 'Jetbrains Mono', monospace;

		> * {
			display: block;
			position: absolute;
			top: 50%;
			left: 50%;
			width: 3rem;
			height: 3rem;
			margin: calc(-1 * (3rem / 2));
		}

		> *:nth-of-type(1) {
			transform: rotate(-18deg) translate(15rem) rotate(18deg);
		}

		> *:nth-of-type(2) {
			transform: rotate(54deg) translate(15rem) rotate(-54deg);
		}

		> *:nth-of-type(3) {
			transform: rotate(126deg) translate(15rem) rotate(-126deg);
		}

		> *:nth-of-type(4) {
			transform: rotate(198deg) translate(15rem) rotate(-198deg);
		}

		> *:nth-of-type(5) {
			transform: rotate(270deg) translate(15rem) rotate(-270deg);
		}

		@media (max-width: 767px) {
			width: 20rem;
			height: 20rem;

			> * {
				width: 2rem;
				height: 2rem;
				margin: -1rem;
			}

			> *:nth-of-type(1) {
				transform: rotate(-18deg) translate(10rem) rotate(18deg);
			}

			> *:nth-of-type(2) {
				transform: rotate(54deg) translate(10rem) rotate(-54deg);
			}

			> *:nth-of-type(3) {
				transform: rotate(126deg) translate(10rem) rotate(-126deg);
			}

			> *:nth-of-type(4) {
				transform: rotate(198deg) translate(10rem) rotate(-198deg);
			}

			> *:nth-of-type(5) {
				transform: rotate(270deg) translate(10rem) rotate(-270deg);
			}
		}
	}

	.container {
		display: grid;
		place-items: center;
		position: relative;

		@media (min-width: 969px) {
			padding: 0 6rem;
		}
	}

	.logo {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 7;
		transform: translate(-50%, -50%);
		width: clamp(4rem, 20vw, 7rem);
	}

	.reset {
		position: absolute;
		right: 8px;
		top: 8px;
		z-index: 20;
		font-size: 1.2rem;
		padding: 0.5rem;
		border-radius: 8px;
		background-color: color-mix(in lch, var(--app-color-dark), transparent 70%);
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
