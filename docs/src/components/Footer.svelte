<script lang="ts">
	import { FRAMEWORKS } from '$helpers/constants';

	interface Props {
		pathname: string;
	}

	let { pathname }: Props = $props();

	const ariaCurrentVal = (path: string) => (pathname.endsWith(path) ? 'page' : 'false');
</script>

<section class="footer container">
	<nav>
		<ul class="group">
			<span class="title">Libraries</span>

			{#each FRAMEWORKS as { name }}
				<li>
					<a href="/docs/{name}" aria-current={ariaCurrentVal(name)}>
						{name}
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<span class="spacer"></span>

	<div class="copyright">
		&copy; 2021-{new Date().getUTCFullYear()} Puru Vijay
	</div>
</section>

<style lang="scss">
	.footer {
		width: 100%;
		padding: 2rem 0.5rem;

		display: grid;
		grid-template-columns: auto 1fr auto;
	}

	ul {
		list-style-type: none;

		padding: 0;

		display: flex;
		gap: 1rem;
	}
</style>
