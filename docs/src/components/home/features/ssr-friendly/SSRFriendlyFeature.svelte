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
	img {
		width: clamp(10rem, 60%, 30rem);
	}

	.frameworks-list {
		display: flex;
		justify-content: center;
	}
</style>
