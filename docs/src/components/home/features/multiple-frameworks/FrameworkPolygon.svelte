<script lang="ts">
	// TODO: MAKE IT FANCYYCYYYYYYYYYYYY 😡😡😡😡😡😡😡😡😡😡😡😡😡😡😡
	import { FRAMEWORKS } from 'src/helpers/constants';

	// @ts-ignore
	import LogosSvelteIcon from '~icons/logos/svelte-icon';
	// @ts-ignore
	import LogosReactIcon from '~icons/logos/react';
	// @ts-ignore
	import LogosVueIcon from '~icons/logos/vue';
	// @ts-ignore
	import LogosSolidIcon from '~icons/logos/solidjs-icon';
	// @ts-ignore
	import LogosVanillaIcon from '~icons/logos/javascript';
	// @ts-ignore
	import IonReloadIcon from '~icons/ion/reload';

	import FrameworkButton from './FrameworkVertex.svelte';

	let logoEl: HTMLImageElement;

	let resetFns = {
		svelte: () => {},
		react: () => {},
		vue: () => {},
		solid: () => {},
		vanilla: () => {},
	};

	// let frameworks = ['vanilla', 'svelte', 'react', 'vue', 'solid'];
	const frameworks = ['solid', 'vanilla', 'react', 'vue', 'svelte']
		.map((name) => FRAMEWORKS.find((f) => f.name === name)!)!
		.map(({ name }) => ({
			name,
			icon: {
				svelte: LogosSvelteIcon,
				react: LogosReactIcon,
				vue: LogosVueIcon,
				solid: LogosSolidIcon,
				vanilla: LogosVanillaIcon,
			}[name],
		}));
</script>

<section class="container framework-polygon">
	<button
		class="reset"
		on:click={() => Object.values(resetFns).forEach((fn) => fn())}
	>
		<IonReloadIcon />
	</button>

	<section class="animation-frameworks">
		{#each frameworks as { name, icon: Icon }}
			<div>
				<FrameworkButton on:select bind:resetFns framework={name} {logoEl}>
					<Icon />
				</FrameworkButton>
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
		transform: translate(-50%, -50%);
		width: 10rem;
	}

	.animation-frameworks {
		@include on-circle($item-count: 5, $circle-size: 40rem, $item-size: 4rem);

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
