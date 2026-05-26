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
	import {
		apply_docs_route_context,
		framework_from_path,
	} from '$helpers/framework-route';
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { framework_brand_var } from '$helpers/framework-brand';
	import { Draggable } from '@neodrag/svelte';
	import { ControlFrom, controls } from '@neodrag/svelte/plugins';
	import { prefetch } from 'astro:prefetch';
	import type { Component } from 'svelte';
	import { expoOut } from 'svelte/easing';
	import { MediaQuery } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import DockItem from './DockItem.svelte';

	type NavList = ReturnType<typeof import('$/nav').get_nav_list>;

	type Props = {
		pathname: string;
		framework?: Framework | 'core';
		nav_by_framework: Record<string, NavList>;
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

	const { pathname: initial_pathname, framework: route_framework, nav_by_framework }: Props =
		$props();

	const dock_brand = $derived(
		route_framework ? `var(${framework_brand_var(route_framework)})` : undefined,
	);

	const frameworks: Framework[] = ['solid', 'react', 'svelte', 'vue', 'vanilla'];

	let pathname = $state(initial_pathname);
	let dock_mouse_x = $state<number | null>(null);
	let menu_view = new MenuView();

	const selected = $derived.by(() => {
		const fw = framework_from_path(pathname);
		return fw && fw !== 'core' ? fw : undefined;
	});

	const nav_list = $derived(
		selected ? (nav_by_framework[selected] ?? nav_by_framework.svelte) : nav_by_framework.svelte,
	);

	const FRAMEWORK_PATH_RE = /\/docs\/(svelte|react|solid|vanilla|vue)/i;

	function replace_framework_from_pathname(framework: Framework) {
		return pathname === '/'
			? `${pathname}docs/${framework}`
			: pathname.replace(FRAMEWORK_PATH_RE, `/docs/${framework}`);
	}

	function sync_route_from_location() {
		pathname = window.location.pathname;
		apply_docs_route_context(pathname);
	}

	$effect(() => {
		pathname;
		apply_docs_route_context(pathname);
	});

	$effect(() => {
		sync_route_from_location();
		document.addEventListener('astro:page-load', sync_route_from_location);
		return () => document.removeEventListener('astro:page-load', sync_route_from_location);
	});

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

	const enable_dock_zoom = new MediaQuery('(min-width: 768px)');

	const dock_btn =
		'grid h-full min-w-[3.25rem] place-items-center bg-transparent p-2.5 text-[1.35rem] text-[color-mix(in_lch,var(--app-color-dark),transparent_28%)] transition-[color,background-color] duration-75 hover:text-brand focus-visible:text-brand';
</script>

<div
	class={[
		'pointer-events-none fixed inset-0 z-[999] hidden bg-black/50 opacity-0 transition-opacity duration-200 max-md:block',
		menu_view.open && 'pointer-events-auto opacity-100',
	]}
></div>

<section
	class="dock-host pointer-events-none fixed bottom-4 left-0 z-[1000] flex h-24 w-full items-end justify-center gap-[clamp(2rem,10vw,8rem)] p-1.5 max-md:bottom-0 max-md:h-auto max-md:min-h-16 max-md:justify-stretch max-md:gap-0 max-md:p-0"
	style:--color-brand={dock_brand}
	style:--secondary-color={dock_brand}
>
	<div
		class="dock-angular-bevel dock-surface pointer-events-auto relative w-full overflow-visible shadow-[var(--dock-shadow)] max-md:h-auto max-md:min-h-16 md:h-full md:w-auto"
		{@attach dockDrag.attachment}
		{@attach interact_outside(() => menu_view.close())}
	>
		<div
			class="dock-shell-fill dock-angular-bevel__fill relative flex w-full min-h-0 flex-col items-end overflow-hidden max-md:min-h-16 max-md:p-0 md:h-full md:overflow-visible md:p-1.5"
		>
			{#if menu_view.open}
				<div
					class="dock-mobile-menu w-full shrink-0"
					transition:slide={{ duration: 400, easing: expoOut }}
				>
					<div class="dock-mobile-menu__body">
						<div class="dock-menu-scroll max-h-[48vh] overflow-y-auto">
							<Nav compact {pathname} {nav_list} onclick={() => menu_view.toggle()} />
						</div>
						<div>{@render framework_selector(true)}</div>
						<ThemeSwitcher embedded />
					</div>
				</div>
			{/if}

			<div class="relative z-[1] flex h-full w-full shrink-0 max-md:h-16">
				<div class="hidden items-end max-md:hidden md:flex">
					{@render framework_selector(false)}
					<div
						class="mx-0.5 my-1.5 w-px min-h-9 self-stretch bg-gradient-to-b from-transparent via-[var(--dock-border-strong)] to-transparent"
					></div>
					<ThemeSwitcher />
					<div
						class="mx-0.5 my-1.5 w-px min-h-9 self-stretch bg-gradient-to-b from-transparent via-[var(--dock-border-strong)] to-transparent"
					></div>
					{@render github()}
					<div
						class="mx-0.5 my-1.5 w-px min-h-9 self-stretch bg-gradient-to-b from-transparent via-[var(--dock-border-strong)] to-transparent"
					></div>
					<div class="dock-angular-bevel dock-angular-bevel--sm handle" data-paw-cursor="true">
						<div class="{dock_btn} dock-angular-bevel__fill">
							<GridIcon />
						</div>
					</div>
				</div>

				<div class="hidden h-full min-h-16 w-full items-center max-md:flex">
					<a href="/" class="unstyled ml-3 flex items-center gap-2.5">
						<img src="/logo.svg" alt="Neodrag" class="h-9 w-9" />
						<span class="m-0 font-sans text-lg font-extrabold tracking-[-0.02em] text-fg"
							>Neodrag</span
						>
					</a>
					<span class="flex-1"></span>
					{@render github(true)}
					<button
						type="button"
						class="{dock_btn} dock-mobile-action unstyled w-12 [&_svg]:!w-7"
						aria-expanded={menu_view.open}
						aria-label={menu_view.open ? 'Close menu' : 'Open menu'}
						onclick={() => menu_view.toggle()}
					>
						<MenuIcon />
					</button>
				</div>
			</div>
		</div>
	</div>
</section>

{#snippet github(mobile = false)}
	{#if mobile}
		<a
			href="https://github.com/PuruVJ/neodrag"
			target="_blank"
			rel="external"
			class="{dock_btn} dock-mobile-action unstyled !text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_svg]:h-auto [&_svg]:w-8 [&_svg]:max-md:w-7 [&_path]:!text-current [&_g]:!text-current [&_svg]:!text-current"
		>
			<GithubIcon />
		</a>
	{:else}
		<div class="dock-angular-bevel dock-angular-bevel--sm h-full">
			<a
				href="https://github.com/PuruVJ/neodrag"
				target="_blank"
				rel="external"
				class="{dock_btn} dock-angular-bevel__fill unstyled !text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_svg]:h-auto [&_svg]:w-8 [&_path]:!text-current [&_g]:!text-current [&_svg]:!text-current"
			>
				<GithubIcon />
			</a>
		</div>
	{/if}
{/snippet}

{#snippet framework_selector(embedded = false)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={[
			'dock-zoom flex w-full items-end justify-center gap-0.5 overflow-visible',
			!embedded && 'max-md:hidden',
		]}
		onmouseenter={() => {
			for (const framework of FRAMEWORKS) {
				prefetch(replace_framework_from_pathname(framework.name));
			}
		}}
		onmousemove={(e) => {
			if (enable_dock_zoom.current) dock_mouse_x = e.clientX;
		}}
		onmouseleave={() => (dock_mouse_x = null)}
	>
		{#each frameworks as name}
			<a
				class="unstyled flex origin-bottom items-end"
				href={replace_framework_from_pathname(name)}
				onclick={() => menu_view.toggle()}
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
