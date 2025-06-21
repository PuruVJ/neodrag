<script lang="ts">
	import { portal } from '$attachments/portal.svelte';
	import { theme } from '$state/user-preferences.svelte.ts';
	import type { Snippet } from 'svelte';
	import { inview } from 'svelte-inview';
	import { expoOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, slide } from 'svelte/transition';
	import CloseIcon from '~icons/material-symbols/close-rounded';
	import MenuIcon from '~icons/ri/menu-3-fill';

	let {
		children,
	}: {
		children: Snippet;
	} = $props();

	let shadow = $state(false);
	let is_nav_open = $state(false);

	let nav_transition = $derived(!prefersReducedMotion.current ? slide : fade);
</script>

<div
	class="view-judge"
	{@attach portal('#docs-container main')}
	use:inview={{ threshold: 0.1 }}
	oninview_change={() => (shadow = false)}
	oninview_leave={() => (shadow = true)}
></div>

<header class:shadow class:dark={theme.current === 'dark'}>
	<a href="/" class="logo unstyled">
		<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
		<p class="h3">Neodrag</p>
	</a>

	<span class="spacer"></span>

	<button onclick={() => (is_nav_open = true)}>
		<MenuIcon />
	</button>
</header>

{#if is_nav_open}
	<!-- svelte-ignore a11y_autofocus -->
	<nav
		class:dark={theme.current === 'dark' && shadow}
		autofocus
		transition:nav_transition={{ easing: expoOut, duration: 800 }}
	>
		<button class="close-button" onclick={() => (is_nav_open = false)}>
			<CloseIcon />
		</button>

		{@render children?.()}
	</nav>
{/if}

<style>
	.view-judge {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		height: 4px;

		pointer-events: none;
	}

	header {
		position: fixed;
		top: 0;
		left: 50%;
		z-index: 10000;

		display: grid;
		grid-template-columns: auto 1fr auto;

		padding: 0.25rem 0.25rem;
		width: calc(100% - 1.5rem);

		border-radius: 0 0 1rem 1rem;

		transform: translateX(-50%);

		transition: 150ms ease-in;
		transition-property: background-color, box-shadow;

		&.shadow {
			box-shadow:
				0 3.4px 6.3px #00000019,
				0 27px 50px #0000001a;
			background-color: var(--app-color-scrolling-navbar);
		}
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		text-decoration: none;

		margin: 0;

		font-weight: 600;

		img {
			width: 2rem;
		}
	}

	p {
		margin: 0;
	}

	nav {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 10000;

		background-color: var(--app-color-scrolling-navbar);

		height: 100%;
		width: 100%;

		button {
			position: absolute;
			right: 0.75rem;
			top: 0.75rem;

			font-size: 1.4rem;
		}
	}
</style>
