<script lang="ts">
	import GridIcon from '~icons/iconoir/dots-grid-3x3';
	import VanillaIcon from '~icons/ri/javascript-fill';
	import MenuIcon from '~icons/ri/menu-3-fill';
	import ReactIcon from '~icons/ri/reactjs-fill';
	import SvelteIcon from '~icons/ri/svelte-fill';
	import VueIcon from '~icons/ri/vuejs-fill';
	import SolidIcon from '~icons/tabler/brand-solidjs';
	import GithubIcon from '~icons/mdi/github';

	import { interact_outside } from '$attachments/interact-outside';
	import Nav from '$components/docs/Nav.svelte';
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { Draggable } from '@neodrag/svelte';
	import { ControlFrom, controls } from '@neodrag/svelte/plugins';
	import { prefetch } from 'astro:prefetch';
	import type { Component } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { on } from 'svelte/events';
	import { MediaQuery } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import DockItem from './DockItem.svelte';

	type Props = {
		pathname: string;
		selected: Framework;
		nav_list: ReturnType<typeof import('$/nav').get_nav_list>;
	};

	class MenuView {
		#open = $state(false);

		get open() {
			return this.#open;
		}

		toggle() {
			this.#open = !this.#open;
		}

		close() {
			this.#open = false;
		}
	}

	const { pathname, selected, nav_list }: Props = $props();

	const frameworks: Framework[] = ['solid', 'react', 'svelte', 'vue', 'vanilla'];

	let dock_mouse_x = $state<number | null>(null);
	let menu_view = new MenuView();

	const REGEX = /\/docs\/(svelte|react|solid|vanilla|vue)/gi;

	function replace_framework_from_pathname(framework: Framework) {
		return pathname === '/'
			? `${pathname}docs/${framework}`
			: pathname.replace(REGEX, `/docs/${framework}`);
	}

	const Icons: Record<Framework, Component> = {
		svelte: SvelteIcon,
		react: ReactIcon,
		solid: SolidIcon,
		vanilla: VanillaIcon,
		vue: VueIcon,
	};

	const dockDrag = new Draggable({
		plugins: [controls({ allow: ControlFrom.selector('.handle') })],
	});

	const is_tablet = new MediaQuery('(max-width: 967px)');
</script>

<div class={['overlay', menu_view.open && 'visible']}></div>

<section class="dock-container">
	<div
		class={['dock-el', 'dock-angular', menu_view.open && 'menu-open dock-angular--bar']}
		{@attach dockDrag.attachment}
		{@attach interact_outside(() => menu_view.close())}
	>
		<div class="mobile expanded-menu">
			{#if menu_view.open}
				<div style="width: 100%" transition:slide={{ duration: 400, easing: expoOut }}>
					<div class="nav">
						<Nav compact {pathname} {nav_list} onclick={() => menu_view.toggle()} />
					</div>

					<div>
						{@render framework_selector(true)}
					</div>

					<div>
						<ThemeSwitcher embedded />
					</div>
				</div>
			{/if}
		</div>

		<div class="main">
			<div class="desktop">
				{@render framework_selector(false)}

				<div class="divider"></div>

				<ThemeSwitcher />

				<div class="divider"></div>

				{@render github()}

				<div class="divider"></div>

				<div class="handle" data-paw-cursor="true">
					<GridIcon />
				</div>
			</div>

			<div class="mobile">
				<a href="/" class="logo unstyled">
					<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
					<span class="h3">Neodrag</span>
				</a>

				<span style="flex: 1 1 auto"></span>

				{@render github()}

				<div class="menu">
					<button onclick={() => menu_view.toggle()}>
						<MenuIcon />
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

{#snippet github()}
	<a
		href="https://github.com/PuruVJ/neodrag"
		target="_blank"
		rel="external"
		class="unstyled github"
	>
		<GithubIcon />
	</a>
{/snippet}

{#snippet framework_selector(embedded = false)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={['zoomable', !embedded && 'desktop']}
		onmouseenter={() => {
			for (const framework of FRAMEWORKS) {
				prefetch(replace_framework_from_pathname(framework.name));
			}
		}}
		onmousemove={(e) => !is_tablet.current && (dock_mouse_x = e.clientX)}
		onmouseleave={() => (dock_mouse_x = null)}
	>
		{#each frameworks as name}
			<a
				class="unstyled"
				href={replace_framework_from_pathname(name)}
				onclick={() => {
					menu_view.toggle();
				}}
			>
				<DockItem
					mouse_x={dock_mouse_x}
					framework={name}
					selected={selected === name}
					Icon={Icons[name]}
					{embedded}
				/>
			</a>
		{/each}
	</div>
{/snippet}

<!-- <MobileMenu {popover} --background-color="var(--background-color)" /> -->

<style>
	/* enabled! */
	@custom-media --tablet (width <= 768px);

	.overlay {
		display: none;

		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;

		width: 100%;
		height: 100%;

		opacity: 0;
		background-color: color-mix(in lch, black, transparent 50%);

		transition: opacity 200ms ease-in;
		pointer-events: none;

		&.visible {
			opacity: 1;
			pointer-events: all;
		}

		@media (--tablet) {
			display: block;
		}
	}

	.h3 {
		margin: 0;
	}

	a {
		transition: scale 150ms ease-in;
		transform-origin: center bottom;

		text-decoration: none;
	}

	.dock-container {
		--background-color: var(--dock-surface);

		display: flex;
		gap: clamp(2rem, 10vw, 8rem);
		align-items: end;

		justify-content: center;

		position: fixed;
		left: 0;
		bottom: 1rem;
		z-index: 1000;

		width: 100%;
		height: 5rem;

		padding: 0.4rem;

		&:not(.dock-hidden) {
			pointer-events: none;
		}

		:global(svg) {
			width: 4rem;
			max-width: unset;
		}

		@media (--tablet) {
			bottom: 0;
			padding: 0;
			height: 4rem;
		}
	}

	.dock-el {
		backface-visibility: hidden;

		display: flex;
		flex-direction: column;

		background-color: var(--background-color);
		border: 2px solid var(--dock-border);
		box-shadow:
			var(--dock-accent-glow),
			inset 0 1px 0 color-mix(in lch, var(--app-color-anti-mixer), transparent 88%),
			var(--dock-shadow);
		backdrop-filter: blur(18px) saturate(1.12);

		position: relative;

		padding: 0.35rem 0.45rem;

		height: 100%;

		display: flex;
		align-items: flex-end;

		transition:
			transform 0.3s ease,
			height 0.2s ease-in;

		&:not(.hidden) {
			pointer-events: auto;
		}

		* {
			transform: translate3d(-1px);
			backface-visibility: hidden;
		}

		.main {
			position: relative;
			z-index: 1;
			display: flex;
			height: 100%;
			width: 100%;

			.mobile {
				display: none;

				.logo {
					display: flex;
					align-items: center;
					gap: 0.5rem;
					margin-left: 0.6rem;
					img {
						height: 2rem;
						width: 2rem;
					}
				}
			}

			.desktop {
				display: flex;
			}

			@media (--tablet) {
				height: 100%;
				.mobile {
					display: flex;
					width: 100%;
				}

				.desktop {
					display: none;
				}
			}
		}

		@media (--tablet) {
			width: min(96%, 40rem);
			bottom: 0.5rem;
			height: auto;
		}

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			pointer-events: none;
			background: linear-gradient(
				135deg,
				color-mix(in lch, var(--app-color-primary), transparent 88%) 0%,
				transparent 35%,
				transparent 65%,
				color-mix(in lch, var(--app-color-primary), transparent 92%) 100%
			);
			opacity: 0.55;
		}
	}

	.expanded-menu {
		display: none;

		width: 100%;

		@media (--tablet) {
			display: block;
			/* contain: layout style;
			will-change: height; */
		}

		.nav {
			max-height: 48vh;
			overflow-y: auto;
		}
	}

	.zoomable {
		display: flex;
		align-items: flex-end;
		justify-content: space-around;

		width: 100%;

		@media (--tablet) {
			&.desktop {
				display: none;
			}
		}
	}

	.divider {
		align-self: stretch;
		width: 2px;
		min-height: 2.25rem;
		margin: 0.35rem 0.15rem;
		background: linear-gradient(
			180deg,
			transparent,
			var(--dock-border-strong) 18%,
			var(--dock-border-strong) 82%,
			transparent
		);
	}

	.handle,
	.menu button {
		height: 100%;
		min-width: 3.25rem;
		padding: 0.65rem;
		display: grid;
		place-items: center;
		font-size: 1.35rem;
		border: 2px solid transparent;
		background: transparent;
		color: color-mix(in lch, var(--app-color-dark), transparent 28%);
		transition:
			border-color 75ms ease,
			color 75ms ease,
			background-color 75ms ease;
	}

	.handle:hover,
	.handle:focus-visible,
	.menu button:hover,
	.menu button:focus-visible {
		border-color: color-mix(in lch, var(--app-color-primary), transparent 45%);
		background: color-mix(in lch, var(--app-color-primary), transparent 90%);
		color: var(--app-color-primary);
	}

	.handle {
		clip-path: polygon(
			var(--dock-cut-sm) 0%,
			100% 0%,
			100% calc(100% - var(--dock-cut-sm)),
			calc(100% - var(--dock-cut-sm)) 100%,
			0% 100%,
			0% var(--dock-cut-sm)
		);

		@media (--tablet) {
			display: none;
		}
	}

	.menu {
		display: none;

		@media (--tablet) {
			display: flex;
		}
	}

	.menu button {
		width: 3rem;

		:global {
			svg {
				width: 1.7rem !important;
			}
		}
	}

	.github {
		display: grid;
		place-items: center;
		height: 100%;
		min-width: 3rem;
		padding: 0.65rem;
		border: 2px solid transparent;
		color: color-mix(in lch, var(--app-color-dark), transparent 25%) !important;
		clip-path: polygon(
			0% var(--dock-cut-sm),
			var(--dock-cut-sm) 0%,
			100% 0%,
			100% calc(100% - var(--dock-cut-sm)),
			calc(100% - var(--dock-cut-sm)) 100%,
			0% 100%
		);
		transition:
			border-color 75ms ease,
			color 75ms ease,
			background-color 75ms ease;

		&:hover,
		&:focus-visible {
			border-color: color-mix(in lch, var(--app-color-primary), transparent 45%);
			background: color-mix(in lch, var(--app-color-primary), transparent 90%);
			color: var(--app-color-primary) !important;
		}

		:global {
			svg {
				will-change: width;
				width: 1.7rem;
				height: auto;
				width: 2rem;

				@media (--tablet) {
					width: 1.7rem;
				}

				&,
				g,
				path {
					color: currentColor !important;
				}
			}
		}
	}
</style>
