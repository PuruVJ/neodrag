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

<section>
	<button on:click={() => Object.values(resetFns).forEach((fn) => fn())}>
		Reset
	</button>

	<section class="animation-frameworks">
		{#each frameworks as { name, icon: Icon }}
			<div>
				<FrameworkButton bind:resetFns framework={name} {logoEl}>
					<Icon />
				</FrameworkButton>
			</div>
		{/each}
	</section>
</section>

<img bind:this={logoEl} src="/logo.svg" class="logo" alt="Neodrag logo" />

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

		margin: 0 auto;
		padding: 0 1rem;
		font-size: 3rem;
		font-weight: 600;
		font-family: 'Jetbrains Mono', monospace;
	}
</style>
