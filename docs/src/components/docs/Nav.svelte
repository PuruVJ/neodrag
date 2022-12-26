<script lang="ts">
	import { FRAMEWORKS } from '$helpers/constants';

	const pathname = globalThis?.location?.pathname ?? '';

	const ariaCurrentVal = (path: string) =>
		pathname.endsWith(path) ? 'page' : 'false';
</script>

<!-- Component should be wrapped in an <aside> or <header> -->
<div class="nav container">
	<a href="/" class="h3 logo unstyled">
		<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
		Neodrag
	</a>

	<nav>
		<ul class="group">
			<div class="title">Libraries</div>

			{#each FRAMEWORKS as { name }}
				<li>
					<a
						href={`/docs/${name}`}
						aria-current={ariaCurrentVal(name)}
						class="unstyled"
					>
						{name}
					</a>
				</li>
			{/each}
		</ul>

		<hr />

		<ul class="group">
			<div class="title">Guides</div>
			<li>
				<a
					href="/docs/migrating/svelte-drag"
					aria-current={ariaCurrentVal('/docs/migrating/svelte-drag')}
					class="unstyled"
				>
					Svelte Drag to Neodrag</a
				>
			</li>
		</ul>
	</nav>

	<span class="spacer" />

	<span>&copy; 2021-{new Date().getUTCFullYear()} Puru Vijay</span>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		height: 100%;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		text-decoration: none;

		font-weight: 600;

		margin: 1rem;

		img {
			width: 3rem;
		}
	}

	nav {
		flex: 1 1 auto;

		padding: 0.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		padding: 0;
	}

	nav a {
		&,
		&:visited {
			display: block;

			padding: 0.25rem 0.5;

			text-decoration: none;
			color: var(--app-color-light-contrast);

			border-radius: 8px;

			transition: background-color 0.15s ease-in-out;

			margin: 0;
		}

		&:hover {
			background-color: hsla(var(--app-color-dark-hsl), 0.2);
		}
	}

	hr {
		margin: 1rem 0;
	}

	.spacer {
		flex: 1 1 auto;
	}
</style>