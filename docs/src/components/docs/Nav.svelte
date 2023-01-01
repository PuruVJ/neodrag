<script lang="ts">
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import { FRAMEWORKS } from '$helpers/constants';

	const pathname = globalThis?.location?.pathname ?? '';

	const ariaCurrentVal = (path: string) =>
		pathname.endsWith(path) ? 'page' : 'false';

	const framework = /\/docs\/(svelte|react|solid|vanilla|vue)/gi.exec(
		pathname
	)?.[1];
</script>

<!-- Component should be wrapped in an <aside> or <header> -->
<div
	class="nav container"
	style:--primary={framework ? `var(--app-color-brand-${framework})` : null}
	style:--primary-hsl={framework
		? `var(--app-color-brand-${framework}-hsl)`
		: null}
>
	<a href="/" class="h3 logo unstyled">
		<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
		Neodrag
	</a>

	<nav>
		<ul class="group">
			<div class="title">Libraries</div>

			{#each FRAMEWORKS as { name }}
				<li style="text-transform: capitalize;">
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

	<div class="theme-switcher">
		<ThemeSwitcher />
	</div>

	<span class="copyright"
		>&copy; 2021-{new Date().getUTCFullYear()}
		<a
			href="https://twitter.com/puruvjdev"
			target="blank"
			rel="noopener noreferrer"
			class:framework
		>
			Puru Vijay</a
		></span
	>
</div>

<style lang="scss">
	@import '../../css/breakpoints';

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

		margin: 0.25rem 1rem;

		@include media('>=tablet') {
			margin: 1rem;
		}

		img {
			width: clamp(2rem, 5vw, 3rem);
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
		padding: 0.25rem 0;
	}

	nav a {
		&,
		&:visited {
			display: block;

			padding: 0.25rem 0.75rem;

			text-decoration: none;
			color: var(--app-color-light-contrast);
			font-family: var(--app-font-mono);
			font-size: 1rem;

			border-radius: 4px;

			transition: background-color 0.05s ease-in;

			margin: 0;
		}

		&:hover {
			background-color: hsla(
				var(--secondary-color-hsl, var(--app-color-primary-hsl)),
				0.1
			);
		}
	}

	hr {
		margin: 1rem 0;
	}

	.spacer {
		flex: 1 1 auto;
	}

	.group .title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--app-color-light-contrast);
		margin-bottom: 1ch;
	}

	.group a {
		&[aria-current='page'] {
			background-color: hsla(
				var(--secondary-color-hsl, var(--app-color-primary-hsl)),
				0.2
			);
		}
	}

	.copyright {
		width: 100%;

		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;

		font-family: var(--app-font-mono);
		font-size: 0.9rem;

		a {
			font-size: inherit;

			&.framework {
				--app-color-primary: var(--secondary-color);
				--app-color-primary-hsl: var(--secondary-color-hsl);
			}
		}
	}

	.theme-switcher {
		display: flex;
		justify-content: center;
		gap: 1rem;

		font-size: 1.5rem;

		width: 100%;
	}
</style>
