<script lang="ts">
	type Props = {
		compact?: boolean;
		pathname: string;
		nav_list: ReturnType<typeof import('$/nav').get_nav_list>;
		onclick?: () => void;
	};

	const { compact = false, pathname, nav_list, onclick }: Props = $props();

	const aria_current_val = (path: string) => (pathname?.endsWith(path) ? 'page' : 'false');
</script>

<!-- Component should be wrapped in an <aside> or <header> -->
<div class="nav container">
	{#if !compact}
		<a href="/" class="h3 logo unstyled">
			<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
			<span class="h3">Neodrag</span>
		</a>
	{/if}

	<nav>
		{#each nav_list as { title, sections }, index}
			<ul class="group">
				<div class="title">{title}</div>
				{#each sections as { slug, title }}
					<li class={[compact && 'compact']}>
						<a href={slug} aria-current={aria_current_val(slug)} class="unstyled" {onclick}>
							{title}
						</a>
					</li>
				{/each}
			</ul>

			{#if index !== nav_list.length - 1}
				<hr />
			{/if}
		{/each}
	</nav>

	<span class="spacer"></span>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: 1rem;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		font-weight: 600;
		margin: 0.25rem 1rem;

		@media (min-width: 968px) {
			margin: 1rem;
		}

		.h3 {
			margin: 0;
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
		margin: 0;

		&.compact {
			padding: 0.125rem;

			a {
				padding: 0.25rem 0.5rem;
			}
		}
	}

	nav a {
		&,
		&:visited {
			display: block;
			padding: 0.25rem 0.75rem;
			text-decoration: none;
			color: color-mix(in lch, var(--app-color-light), var(--app-color-anti-mixer) 90%);
			font-family: var(--app-font-mono);
			font-size: 1rem;
			border-radius: 4px;
			transition: background-color 0.05s ease-in;
			margin: 0;
		}

		&:hover {
			background-color: color-mix(in lch, var(--secondary-color), transparent 90%);
		}
	}

	hr {
		margin: 1rem 0;
		border: none;
		height: 1px;
		box-shadow: inset 0 0 0 2px
			color-mix(in lch, var(--secondary-color), var(--app-color-mixer) 50%);
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
			background-color: color-mix(in lch, var(--secondary-color), transparent 80%);
		}
	}

	/* .theme-switcher {
		display: flex;
		justify-content: center;
		gap: 1rem;
		font-size: 1.5rem;
		width: 100%;
	} */
</style>
