<script lang="ts">
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
	import SIZES from '../../../../data/sizes.json';
</script>

<div class="demo">
	{#each Object.entries(FRAMEWORK_ICONS) as [framework, Icon]}
		<Icon />
	{/each}
</div>

<div class="intro">
	<h2>Small bundle size</h2>
	<p>
		Neodrag will never be heavy on your app. It's designed to be as small as
		possible, so you can use it without worrying about your bundle size.
	</p>

	<br />

	<p style="color: hsla(var(--app-color-dark-hsl), 0.8)">
		Ranging from <code>{SIZES.svelte}KB</code> for
		<span class="text-svelte">Svelte</span>
		to
		<code>{SIZES.react}KB</code> for <span class="text-react">React</span>.

		<br /><br /> <br /><br />

		<sub style="color: inherit;">
			*Sizes in brotli after terser minification
		</sub>
	</p>

	<br /><br />
</div>

<style lang="scss">
	.intro {
		display: grid;
		align-content: center;
	}

	h2 {
		margin-top: 0;
	}

	p {
		font-size: 1.3rem;

		max-width: 50ch;
	}
</style>
