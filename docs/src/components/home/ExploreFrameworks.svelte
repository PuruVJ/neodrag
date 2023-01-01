<script>
	import { FRAMEWORKS } from '$helpers/constants';
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
</script>

<h2 class="h1">Pick your framework</h2>

<section class="frameworks">
	{#each FRAMEWORKS as { name }}
		{@const Icon = FRAMEWORK_ICONS[name]}

		<a class="unstyled" href="/docs/{name}">
			<Icon />
		</a>
	{/each}
</section>

<style lang="scss">
	h2 {
		word-break: normal;

		text-align: center;
	}

	.frameworks {
		display: flex;
		gap: clamp(2rem, 10vw, 8rem);
	}

	a {
		transition: transform 150ms ease-in;

		&:hover {
			transform: scale3d(1.2, 1.2, 1);
		}

		:global(svg) {
			width: clamp(2rem, 10vw, 8rem);
		}
	}
</style>
