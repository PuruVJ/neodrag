<script lang="ts">
	import { theme } from '$stores/user-preferences.store';
</script>

<div class="intro">
	<h2>SSR-friendly</h2>
	<p>
		Neodrag is Server Side Renderable. Will play well with meta-frameworks like
		Sveltekit, NextJS, Nuxt, Vitepress, SolidStart and more
	</p>
</div>

<div class="frameworks-list">
	<img
		src="/home/metaframeworks-{$theme}.webp"
		loading="lazy"
		alt="Metaframeworks"
	/>
</div>

<style lang="scss">
	@import '../feature-box';

	img {
		width: clamp(10rem, 80%, 25rem);
	}

	.frameworks-list {
		display: flex;
		justify-content: center;
	}

	p {
		@include paragraph();
	}
</style>
