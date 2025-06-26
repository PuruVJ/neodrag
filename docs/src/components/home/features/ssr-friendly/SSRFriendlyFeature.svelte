<script lang="ts">
	import { theme } from '$state/user-preferences.svelte.ts';
</script>

<div class="intro">
	<h2>SSR-friendly</h2>
	<p>
		Neodrag is Server Side Renderable. Will play well with meta-frameworks like Sveltekit, NextJS,
		Nuxt, Vitepress, SolidStart and more
	</p>
</div>

<div class="frameworks-list">
	<img src="/home/metaframeworks-{theme.current}.webp" loading="lazy" alt="Metaframeworks" />
</div>

<style>
	img {
		width: clamp(10rem, 80%, 25rem);
	}

	.frameworks-list {
		display: flex;
		justify-content: center;
	}

	p {
		font-size: clamp(1rem, 2vw, 1.3rem);
		/* max-width: clamp(20ch, 80vw, 100ch); */
	}
</style>
