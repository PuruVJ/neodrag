<script lang="ts">
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { ControlFrom, controls, draggable } from '@neodrag/svelte';
	import { prefetch } from 'astro:prefetch';
	import { tick, type Component, type Snippet } from 'svelte';
	import { slide } from 'svelte/transition';
	import GridIcon from '~icons/iconoir/dots-grid-3x3';
	import VanillaIcon from '~icons/ri/javascript-fill';
	import MenuIcon from '~icons/ri/menu-3-fill';
	import ReactIcon from '~icons/ri/reactjs-fill';
	import SvelteIcon from '~icons/ri/svelte-fill';
	import VueIcon from '~icons/ri/vuejs-fill';
	import SolidIcon from '~icons/tabler/brand-solidjs';
	import DockItem from './DockItem.svelte';
	import { expoOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';

	type Props = {
		pathname: string;
		selected: Framework;

		nav_menu: Snippet;
	};

	class MenuView {
		#current = $state<'framework' | 'theme' | 'menu' | null>(null);
		#menu_open = $state(false);

		get current() {
			return this.#current;
		}

		get open() {
			return this.#menu_open;
		}

		async toggle(value: 'framework' | 'theme' | 'menu' | null) {
			this.#menu_open = !this.#menu_open;
			this.#current = value;
		}
	}

	const { pathname, selected, nav_menu }: Props = $props();

	const frameworks: Framework[] = ['solid', 'react', 'svelte', 'vue', 'vanilla'];
	const scales = [1, 1, 1, 1, 1];

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

	const CurrentIcon = $derived(Icons[selected] ?? SvelteIcon);

	const is_tablet = new MediaQuery('(max-width: 967px)');
</script>

<section class="dock-container">
	<div
		class={['dock-el', menu_view.open && 'menu-open']}
		{@attach draggable([controls({ allow: ControlFrom.selector('.handle') })])}
	>
		<div class="mobile expanded-menu">
			{#if menu_view.open}
				<div style="width: 100%" transition:slide={{ duration: 400, easing: expoOut }}>
					{#if menu_view.current === 'framework'}
						{@render framework_selector(false)}
					{:else if menu_view.current === 'theme'}
						<div>
							<ThemeSwitcher embedded />
						</div>
					{:else}
						<div class="nav">
							{@render nav_menu?.()}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<div class="main">
			<div class="desktop">
				{@render framework_selector(true)}

				<div class="divider"></div>

				<ThemeSwitcher />

				<div class="divider"></div>

				<div class="handle" data-paw-cursor="true">
					<GridIcon />
				</div>
			</div>

			<div class="mobile">
				<a href="/" class="logo unstyled">
					<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" />
				</a>

				<span style="flex: 1 1 auto"></span>

				<div class="theme-selector">
					<ThemeSwitcher thumbnail onclick={() => menu_view.toggle('theme')} />
				</div>

				<div class="framework-selector">
					<button onclick={() => menu_view.toggle('framework')}>
						<CurrentIcon />
					</button>
				</div>

				<div class="menu">
					<button onclick={() => menu_view.toggle('menu')}>
						<MenuIcon />
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

{#snippet framework_selector(is_desktop = true)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={['zoomable', is_desktop && 'desktop']}
		onmouseenter={() => {
			for (const framework of FRAMEWORKS) {
				prefetch(replace_framework_from_pathname(framework.name));
			}
		}}
		onmousemove={(e) => !is_tablet.current && (dock_mouse_x = e.clientX)}
		onmouseleave={() => (dock_mouse_x = null)}
	>
		{#each frameworks as name, idx}
			<a
				class="unstyled"
				href={replace_framework_from_pathname(name)}
				style:--scale={scales[idx]}
				onclick={() => {
					menu_view.toggle(null);
				}}
			>
				<DockItem
					mouse_x={dock_mouse_x}
					framework={name}
					selected={selected === name}
					Icon={Icons[name]}
				/>
			</a>
		{/each}
	</div>
{/snippet}

<!-- <MobileMenu {popover} --background-color="var(--background-color)" /> -->

<style>
	/* enabled! */
	@custom-media --tablet (width <= 768px);

	a {
		transition: scale 150ms ease-in;
		scale: var(--scale) var(--scale);
		transform-origin: center bottom;
	}

	.dock-container {
		--background-color: color-mix(
			in lch,
			var(--secondary-color, var(--app-color-primary)),
			var(--app-color-mixer) 60%
		);

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

		box-shadow:
			inset 0 0 0 0.2px color-mix(in lch, var(--gray-1), transparent 30%),
			0 0 0 0.2px color-mix(in lch, var(--gray-9), transparent 30%),
			hsla(0, 0%, 0%, 0.3) 2px 5px 19px 7px;

		position: relative;

		padding: 0.3rem;

		border-radius: 25rem;

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
			border-radius: 2rem;
			width: 90%;
			bottom: 1rem;
			height: auto;
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
		height: 100%;
		width: 0.2px;

		background-color: color-mix(in lch, var(--app-color-dark), transparent 70%);

		margin: 0 4px;
	}

	.handle,
	.menu {
		height: 100%;
		width: 4rem;

		padding: 0.75rem;
		display: flex;

		font-size: 1.4rem;

		@media (--tablet) {
			display: none;
		}
	}

	.menu,
	.framework-selector {
		display: flex;
		padding: 0.75rem;
		width: 3rem;

		:global {
			svg {
				width: 1.7rem !important;
			}
		}
	}
</style>
