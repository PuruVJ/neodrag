<script lang="ts">
	import GridIcon from '~icons/iconoir/dots-grid-3x3';
	import VanillaIcon from '~icons/ri/javascript-fill';
	import MenuIcon from '~icons/ri/menu-3-fill';
	import ReactIcon from '~icons/ri/reactjs-fill';
	import SvelteIcon from '~icons/ri/svelte-fill';
	import VueIcon from '~icons/ri/vuejs-fill';
	import SolidIcon from '~icons/tabler/brand-solidjs';

	import { interact_outside } from '$attachments/interact-outside';
	import Nav from '$components/docs/Nav.svelte';
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { ControlFrom, controls, draggable } from '@neodrag/svelte';
	import { prefetch } from 'astro:prefetch';
	import { onMount, type Component } from 'svelte';
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

	const is_tablet = new MediaQuery('(max-width: 967px)');

	onMount(() => {
		return on(window, 'astro:after-swap', (e) => console.log(e));
	});
</script>

<div class={['overlay', menu_view.open && 'visible']}></div>

<section class="dock-container">
	<div
		class={['dock-el', menu_view.open && 'menu-open']}
		{@attach draggable([controls({ allow: ControlFrom.selector('.handle') })])}
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

				<!-- <div class="theme-selector">
					{#await tick() then _}
						<ThemeSwitcher thumbnail onclick={() => menu_view.toggle('theme')} />
					{/await}
				</div>

				<div class="framework-selector">
					<button onclick={() => menu_view.toggle('framework')}>
						<CurrentIcon />
					</button>
				</div> -->

				<div class="menu">
					<button onclick={() => menu_view.toggle()}>
						<MenuIcon />
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

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
			width: 95%;
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

	.menu {
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
