<script lang="ts">
	import { type Framework } from '$helpers/constants';
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';

	const frameworks: Framework[] = ['solid', 'react', 'svelte', 'vue', 'vanilla'];
	const scales = [1, 1, 1, 1, 0.85];
</script>

<h2 class="h1">Pick your framework</h2>

<section class="frameworks">
	{#each frameworks as name, idx}
		{@const Icon = FRAMEWORK_ICONS[name]}

		<a class="unstyled" href="/docs/framework/{name}" style:--scale={scales[idx]}>
			<Icon />
		</a>
	{/each}
</section>

<style>
	h2 {
		word-break: normal;

		text-align: center;
	}

	.frameworks {
		display: flex;
		gap: clamp(2rem, 10vw, 8rem);
		align-items: end;
	}

	a {
		transition: scale 150ms ease-in;
		scale: var(--scale) var(--scale);
		transform-origin: center bottom;

		:global(svg) {
			width: clamp(2rem, 10vw, 8rem);
		}
	}
</style>
