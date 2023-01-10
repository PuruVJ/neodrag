<script lang="ts">
	// @ts-ignore
	import MenuIcon from '~icons/ri/menu-3-fill';
	//@ts-ignore
	import CloseIcon from '~icons/material-symbols/close-rounded';

	import { inview } from 'svelte-inview';
	import { expoOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	import Nav from './docs/Nav.svelte';

	import { portal } from '$actions/portal';
	import { browser } from '$helpers/utils';
	import { prefersReducedMotion, theme } from '$stores/user-preferences.store';

	const isTablet = globalThis.matchMedia('(max-width: 768px)')?.matches;

	let shadow = false;

	let isNavOpen = false;

	$: navTransition = !$prefersReducedMotion ? slide : fade;

	$: themeColor = (() => {
		$theme;
		isTablet;

		if (!browser) return;

		const value = getComputedStyle(document.body).getPropertyValue(
			'--app-color-scrolling-navbar'
		);

		return value?.trim();
	})();
</script>

<svelte:head>
	<meta name="theme-color" content={themeColor} />
</svelte:head>

<div
	class="view-judge"
	use:portal={'#docs-container main'}
	use:inview={{ threshold: 0.1 }}
	on:change={() => (shadow = false)}
	on:leave={() => (shadow = true)}
/>

<header class:shadow class:dark={$theme === 'dark'}>
	<a href="/" class="logo unstyled">
		<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
		<p class="h3">Neodrag</p>
	</a>

	<span class="spacer" />

	<button on:click={() => (isNavOpen = true)}>
		<MenuIcon />
	</button>
</header>

{#if isNavOpen}
	<!-- svelte-ignore a11y-autofocus -->
	<nav
		class:dark={$theme === 'dark' && shadow}
		autofocus
		transition:navTransition={{ easing: expoOut, duration: 800 }}
	>
		<button class="close-button" on:click={() => (isNavOpen = false)}>
			<CloseIcon />
		</button>
		<Nav />
	</nav>
{/if}

<style lang="scss">
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
			box-shadow: 0 3.4px 6.3px #00000019, 0 27px 50px #0000001a;
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
