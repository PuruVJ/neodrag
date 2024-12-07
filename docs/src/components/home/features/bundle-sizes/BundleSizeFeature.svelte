<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
	import SIZES from '../../../../data/sizes.json';

	const sorted_frameworks = Object.entries(SIZES).sort(
		([, { size: aSize }], [, { size: bSize }]) => +aSize - +bSize,
	);

	const min_size = +sorted_frameworks[0][1].size;
</script>

<div class="intro">
	<h2>Small bundle size</h2>
	<p>
		Neodrag will never be heavy on your app. It's designed to be as small as
		possible, so you can use it without worrying about your bundle size.
	</p>

	<br />

	<p style="color: hsla(var(--app-color-dark-hsl), 0.8)">
		Ranges from <code>{SIZES.svelte.size}KB</code> for
		<span class="text-svelte">Svelte</span>
		to
		<code>{SIZES.react.size}KB</code> for <span class="text-react">React</span>.

		<br /><br />

		<sub style="color: inherit;">
			*Sizes in brotli after terser minification
		</sub>
	</p>

	<br /><br />
</div>

<div class="demo">
	{#each sorted_frameworks.map(([framework, { size }]) => [framework, size, FRAMEWORK_ICONS[framework]] as const) as [framework, size, Icon]}
		<div class="framework-container">
			<div class="icon" style:font-size={(size / min_size) ** 7 * 2 + 'rem'}>
				<Icon />
			</div>
			<div
				class="size"
				style:font-size={(size / min_size) ** 4 + 'rem'}
				style:left="calc(1rem + {(size / min_size) ** 8 * 2}rem)"
			>
				{size} <span class="kb">KB</span>
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	@import '../feature-box';
	@import '../../../../css/breakpoints';

	.demo {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;

		@include media('<desktop') {
			justify-content: center;
		}
	}

	.framework-container {
		position: relative;

		display: flex;
		align-content: center;

		.size {
			position: absolute;
			left: 3rem;
			top: 50%;

			display: flex;
			align-items: center;
			gap: 3px;

			transform: translateY(-50%);

			font-size: 1.2rem;
			font-family: var(--app-font-mono);

			padding: 0.3rem 0.7rem;

			border-radius: 60px;

			.kb {
				color: hsla(var(--app-color-dark-hsl), 0.6);
			}

			@include media('<desktop') {
				position: static;

				transform: initial;
			}
		}
	}

	.intro {
		display: grid;
		align-content: center;
	}

	h2 {
		margin-top: 0;
	}

	p {
		@include paragraph();
	}
</style>
