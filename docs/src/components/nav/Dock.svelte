<script lang="ts">
	import ThemeSwitcher from '$components/ThemeSwitcher.svelte';
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { ControlFrom, controls, draggable } from '@neodrag/svelte';
	import { prefetch } from 'astro:prefetch';
	import type { Component } from 'svelte';
	import GridIcon from '~icons/iconoir/dots-grid-3x3';
	import VanillaIcon from '~icons/ri/javascript-fill';
	import MenuIcon from '~icons/ri/menu-3-fill';
	import ReactIcon from '~icons/ri/reactjs-fill';
	import SvelteIcon from '~icons/ri/svelte-fill';
	import VueIcon from '~icons/ri/vuejs-fill';
	import SolidIcon from '~icons/tabler/brand-solidjs';
	import DockItem from './DockItem.svelte';
	import { Popover } from 'melt/builders';
	import MobileMenu from './MobileMenu.svelte';

	type Props = {
		pathname: string;
		selected: Framework;
	};

	const { pathname, selected }: Props = $props();

	const frameworks: Framework[] = ['solid', 'react', 'svelte', 'vue', 'vanilla'];
	const scales = [1, 1, 1, 1, 1];

	let dock_mouse_x = $state<number | null>(null);

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

	const popover = new Popover({});
</script>

<section class="dock-container">
	<div class="dock-el" {@attach draggable([controls({ allow: ControlFrom.selector('.handle') })])}>
		<!-- <button class="search-button">
			<SearchIcon />
		</button> -->

		<!-- <div class="divider"></div> -->

		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="zoomable"
			onmouseenter={() => {
				for (const framework of FRAMEWORKS) {
					prefetch(replace_framework_from_pathname(framework.name));
				}
			}}
			onmousemove={(e) => (dock_mouse_x = e.clientX)}
			onmouseleave={() => (dock_mouse_x = null)}
		>
			{#each frameworks as name, idx}
				<a
					class="unstyled"
					href={replace_framework_from_pathname(name)}
					style:--scale={scales[idx]}
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

		<div class="divider"></div>

		<ThemeSwitcher />

		<div class="divider"></div>

		<div class="handle" data-paw-cursor="true">
			<GridIcon />
		</div>

		<div class="menu mobile">
			<button {...popover.trigger}>
				<MenuIcon />
			</button>
		</div>
	</div>

	<MobileMenu {popover} />
</section>

<style>
	@custom-media --tablet (width <= 768px);

	a {
		transition: scale 150ms ease-in;
		scale: var(--scale) var(--scale);
		transform-origin: center bottom;

		:global(svg) {
			width: clamp(2rem, 10vw, 8rem);
		}
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

		@media (--tablet) {
			bottom: 0;
			padding: 0;
			height: 4rem;
		}
	}

	.dock-el {
		backface-visibility: hidden;

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

		transition: transform 0.3s ease;

		&:not(.hidden) {
			pointer-events: auto;
		}

		* {
			transform: translate3d(-1px);
			backface-visibility: hidden;
		}

		@media (--tablet) {
			border-radius: 0;
			width: 100%;
			bottom: 0;
			box-shadow: hsla(0, 0%, 0%, 0.3) 2px 5px 19px 7px;
			/* background-color: var(--app-color-scrolling-navbar); */
		}
	}

	.zoomable {
		display: flex;
		align-items: flex-end;
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

		padding: 0.75rem;
		display: flex;

		font-size: 1.4rem;

		@media (--tablet) {
			display: none;
		}
	}

	.menu {
		display: none;

		@media (--tablet) {
			display: block;
		}
	}

	/* .logo {
		display: flex;
		align-items: center;
		height: 100%;
		gap: 0.5rem;

		padding: 0.75rem;

		text-decoration: none;
		font-weight: 600;

		img {
			width: clamp(2rem, 5vw, 3rem);
		}
	} */

	/* .search-button {
		display: flex;
		height: 80%;

		padding: 0 0.6rem;
		margin-bottom: 0.4rem;
		margin-left: 0.4rem;
		margin-right: 0.2rem;
		border-radius: 50%;
		font-size: 1.4rem;

		background-color: color-mix(in lch, var(--app-color-dark), transparent 90%);
	} */
</style>
