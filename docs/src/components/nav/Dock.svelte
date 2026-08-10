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
	import { framework_from_path } from '$helpers/framework-route';
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { init_theme_runtime } from '$state/user-preferences.svelte';
	import { Draggable } from '@neodrag/svelte';
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

	const { pathname: initial_pathname, nav_by_framework }: Props = $props();

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
	}

	$effect(() => {
		init_theme_runtime();
		sync_route_from_location();
		document.addEventListener('astro:page-load', sync_route_from_location);
		document.addEventListener('astro:after-swap', sync_route_from_location);
		return () => {
			document.removeEventListener('astro:page-load', sync_route_from_location);
			document.removeEventListener('astro:after-swap', sync_route_from_location);
		};
	});

	const Icons: Record<Framework, Component> = {
		svelte: SvelteIcon,
		react: ReactIcon,
		solid: SolidIcon,
		vanilla: VanillaIcon,
		vue: VueIcon,
	};

	const dockDrag = new Draggable({});

	const enable_dock_zoom = new MediaQuery('(min-width: 768px)');

	const dock_btn =
		'grid h-14 min-h-14 max-h-14 min-w-[3.25rem] place-items-center bg-transparent p-2.5 text-[1.35rem] text-[color-mix(in_lch,var(--app-color-dark),transparent_28%)] transition-[color,background-color] duration-75 hover:text-brand focus-visible:text-brand';
</script>

<div
	class={[
		'pointer-events-none fixed inset-0 z-999 hidden bg-black/50 opacity-0 transition-opacity duration-200 max-md:block',
		menu_view.open && 'pointer-events-auto opacity-100',
	]}
></div>

<section
	class="dock-host pointer-events-none fixed bottom-4 left-0 z-1000 flex w-full items-end justify-center gap-[clamp(2rem,10vw,8rem)] p-1.5 max-md:bottom-0 max-md:min-h-16 max-md:justify-stretch max-md:gap-0 max-md:p-0 md:overflow-visible"
>
	<div
		class="dock-bevel dock-surface dock-float pointer-events-auto relative w-full overflow-visible max-md:min-h-16 md:h-auto md:w-auto"
		{...dockDrag.attach}
		{@attach interact_outside(() => menu_view.close())}
	>
		<div
			class="dock-shell-fill dock-bevel-fill relative flex w-full flex-col items-end max-md:min-h-16 max-md:overflow-hidden max-md:p-0 md:overflow-visible md:p-1.5"
		>
			{#if menu_view.open}
				<div
					class="dock-mobile-menu w-full shrink-0"
					transition:slide={{ duration: 400, easing: expoOut }}
				>
					<div class="dock-mobile-menu-body">
						<div
							class="docs-sidebar-panel dock-menu-scroll max-h-[48vh] overflow-y-auto overflow-x-hidden"
						>
							<Nav compact {pathname} {nav_list} onclick={() => menu_view.toggle()} />
						</div>
						<div class="docs-sidebar-panel dock-mobile-menu-footer">
							{@render framework_selector(true)}
							<ThemeSwitcher embedded />
						</div>
					</div>
				</div>
			{/if}

			<div
				class="relative z-[1] flex w-full shrink-0 max-md:h-16 md:items-center md:overflow-visible"
			>
				<div
					class="dock-toolbar relative z-[2] hidden max-md:hidden md:flex md:h-14 md:items-center md:overflow-visible"
				>
					{@render framework_selector(false)}
					<div
						class="mx-0.5 my-1.5 w-px min-h-9 self-stretch bg-linear-to-b from-transparent via-(--dock-border-strong) to-transparent"
					></div>
					<ThemeSwitcher inline />
					<div
						class="mx-0.5 my-1.5 w-px min-h-9 self-stretch bg-linear-to-b from-transparent via-(--dock-border-strong) to-transparent"
					></div>
					{@render github()}
					<div
						class="mx-0.5 my-1.5 w-px min-h-9 self-stretch bg-linear-to-b from-transparent via-(--dock-border-strong) to-transparent"
					></div>
					<button
						type="button"
						class="{dock_btn} handle unstyled shrink-0 overflow-visible"
						data-paw-cursor="true"
						aria-label="Drag dock"
						{...dockDrag.handle()}
					>
						<GridIcon />
					</button>
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
		<a
			href="https://github.com/PuruVJ/neodrag"
			target="_blank"
			rel="external"
			class="{dock_btn} unstyled shrink-0 !text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_svg]:h-auto [&_svg]:w-8 [&_path]:!text-current [&_g]:!text-current [&_svg]:!text-current"
		>
			<GithubIcon />
		</a>
	{/if}
{/snippet}

{#snippet framework_selector(embedded = false)}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={[
			'dock-zoom flex shrink-0 overflow-visible',
			embedded
				? 'dock-zoom-embedded h-auto w-full items-stretch justify-stretch'
				: 'h-14 items-end justify-center max-md:hidden',
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
				class={[
					'unstyled overflow-visible',
					embedded ? 'flex min-w-0 flex-1' : 'flex shrink-0 items-end',
				]}
				href={replace_framework_from_pathname(name)}
				onclick={() => {
					if (embedded) menu_view.toggle();
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

<style>
	/* `@apply` + `@theme` tokens in a component <style> need a reference to the global Tailwind entry. */
	@reference '../../styles/app.css';

	/* The dock is a clip-path bevel + theme-switcher primitive used across DockItem / ThemeSwitcher /
	   Nav / the version chip, so its selectors are :global (they style those children's markup). */
	:global {
		.dock-bevel {
			--bevel-cut: var(--spacing-dock-cut-sm);
			--bevel-width: 1px;
			padding: var(--bevel-width);
			background: var(--dock-border, var(--color-border));
			clip-path: polygon(
				var(--bevel-cut) 0%,
				calc(100% - var(--bevel-cut)) 0%,
				100% var(--bevel-cut),
				100% calc(100% - var(--bevel-cut)),
				calc(100% - var(--bevel-cut)) 100%,
				var(--bevel-cut) 100%,
				0% calc(100% - var(--bevel-cut)),
				0% var(--bevel-cut)
			);
		}

		.dock-bevel-sm {
			--bevel-cut: var(--spacing-dock-cut-sm);
		}

		.dock-tooltip {
			--bevel-cut: var(--spacing-dock-cut-xs);
			--bevel-width: 1px;
			padding: var(--bevel-width);
			filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.16)) drop-shadow(0 6px 14px rgb(0 0 0 / 0.2));
			background: color-mix(in lch, var(--color-brand), transparent 55%);
			clip-path: polygon(
				var(--bevel-cut) 0%,
				calc(100% - var(--bevel-cut)) 0%,
				100% var(--bevel-cut),
				100% calc(100% - var(--bevel-cut)),
				calc(100% - var(--bevel-cut)) 100%,
				var(--bevel-cut) 100%,
				0% calc(100% - var(--bevel-cut)),
				0% var(--bevel-cut)
			);
		}

		.dock-tooltip-label {
			display: block;
			color: var(--color-brand);
			background: color-mix(in lch, var(--color-brand), transparent 90%);
			clip-path: polygon(
				calc(var(--bevel-cut) + var(--bevel-width)) var(--bevel-width),
				calc(100% - var(--bevel-cut) - var(--bevel-width)) var(--bevel-width),
				calc(100% - var(--bevel-width)) calc(var(--bevel-cut) + var(--bevel-width)),
				calc(100% - var(--bevel-width)) calc(100% - var(--bevel-cut) - var(--bevel-width)),
				calc(100% - var(--bevel-cut) - var(--bevel-width)) calc(100% - var(--bevel-width)),
				calc(var(--bevel-cut) + var(--bevel-width)) calc(100% - var(--bevel-width)),
				var(--bevel-width) calc(100% - var(--bevel-cut) - var(--bevel-width)),
				var(--bevel-width) calc(var(--bevel-cut) + var(--bevel-width))
			);
		}

		.dock-bevel-fill {
			height: 100%;
			width: 100%;
			background: var(--dock-surface, color-mix(in lch, var(--app-color-shell), transparent 8%));
			clip-path: polygon(
				calc(var(--bevel-cut) + var(--bevel-width)) var(--bevel-width),
				calc(100% - var(--bevel-cut) - var(--bevel-width)) var(--bevel-width),
				calc(100% - var(--bevel-width)) calc(var(--bevel-cut) + var(--bevel-width)),
				calc(100% - var(--bevel-width)) calc(100% - var(--bevel-cut) - var(--bevel-width)),
				calc(100% - var(--bevel-cut) - var(--bevel-width)) calc(100% - var(--bevel-width)),
				calc(var(--bevel-cut) + var(--bevel-width)) calc(100% - var(--bevel-width)),
				var(--bevel-width) calc(100% - var(--bevel-cut) - var(--bevel-width)),
				var(--bevel-width) calc(var(--bevel-cut) + var(--bevel-width))
			);
		}

		.dock-host > .dock-bevel {
			--bevel-cut: 0.7rem;
			clip-path: polygon(
				var(--bevel-cut) 0%,
				calc(100% - var(--bevel-cut)) 0%,
				100% var(--bevel-cut),
				100% 100%,
				0% 100%,
				0% var(--bevel-cut)
			);
		}

		.dock-host > .dock-bevel > .dock-bevel-fill {
			clip-path: polygon(
				calc(var(--bevel-cut) + var(--bevel-width)) var(--bevel-width),
				calc(100% - var(--bevel-cut) - var(--bevel-width)) var(--bevel-width),
				calc(100% - var(--bevel-width)) calc(var(--bevel-cut) + var(--bevel-width)),
				calc(100% - var(--bevel-width)) calc(100% - var(--bevel-width)),
				var(--bevel-width) calc(100% - var(--bevel-width)),
				var(--bevel-width) calc(var(--bevel-cut) + var(--bevel-width))
			);
		}

		@media (min-width: 768px) {
			.dock-host > .dock-bevel {
				--bevel-cut: var(--spacing-dock-cut);
				clip-path: polygon(
					var(--bevel-cut) 0%,
					calc(100% - var(--bevel-cut)) 0%,
					100% var(--bevel-cut),
					100% calc(100% - var(--bevel-cut)),
					calc(100% - var(--bevel-cut)) 100%,
					var(--bevel-cut) 100%,
					0% calc(100% - var(--bevel-cut)),
					0% var(--bevel-cut)
				);
			}

			.dock-host > .dock-bevel > .dock-bevel-fill {
				clip-path: polygon(
					calc(var(--bevel-cut) + var(--bevel-width)) var(--bevel-width),
					calc(100% - var(--bevel-cut) - var(--bevel-width)) var(--bevel-width),
					calc(100% - var(--bevel-width)) calc(var(--bevel-cut) + var(--bevel-width)),
					calc(100% - var(--bevel-width)) calc(100% - var(--bevel-cut) - var(--bevel-width)),
					calc(100% - var(--bevel-cut) - var(--bevel-width)) calc(100% - var(--bevel-width)),
					calc(var(--bevel-cut) + var(--bevel-width)) calc(100% - var(--bevel-width)),
					var(--bevel-width) calc(100% - var(--bevel-cut) - var(--bevel-width)),
					var(--bevel-width) calc(var(--bevel-cut) + var(--bevel-width))
				);
			}
		}

		.dock-bevel-brand {
			background: color-mix(in lch, var(--color-brand), transparent 55%);
		}

		.dock-bevel-brand > .dock-bevel-fill {
			background: color-mix(in lch, var(--color-brand), transparent 90%);
		}

		html[data-framework] .dock-bevel-brand {
			background: var(--chip-border);
		}

		html[data-framework] .dock-bevel-brand > .dock-bevel-fill {
			background: var(--chip-fill);
			color: var(--chip-label);
		}

		.site-kicker {
			@apply font-mono text-[0.68rem] font-extrabold tracking-[0.2em] uppercase;
			color: var(--color-brand);
		}

		.site-kicker::before {
			content: '▍';
			margin-right: 0.35rem;
		}

		.site-section-break {
			@apply flex items-center gap-4 py-2 font-mono text-sm font-black text-fg-muted;
		}

		.site-section-break-line {
			@apply h-px flex-1 bg-(--color-border);
		}

		.dock-mobile-action,
		.dock-mobile-action:hover,
		.dock-mobile-action:focus-visible {
			background: transparent !important;
		}

		.dock-surface {
			--dock-border: rgb(0 0 0 / 0.12);
			--dock-border-strong: rgb(0 0 0 / 0.16);
			--dock-surface: color-mix(in srgb, var(--app-color-shell), var(--color-brand) 4%);
			--dock-accent-glow: none;
			--dock-elevation-filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.14))
				drop-shadow(0 12px 28px rgb(0 0 0 / 0.2));
		}

		.dock-host > .dock-bevel.dock-surface.dock-float {
			box-shadow: none;
			filter: var(--dock-elevation-filter);
		}

		html[data-theme='dark'] .dock-surface {
			--dock-border: rgb(0 0 0 / 0.45);
			--dock-border-strong: rgb(0 0 0 / 0.55);
			--dock-surface: color-mix(in srgb, var(--app-color-shell), var(--color-brand) 8%);
			--dock-elevation-filter: drop-shadow(0 3px 6px rgb(0 0 0 / 0.42))
				drop-shadow(0 14px 32px rgb(0 0 0 / 0.58));
		}

		html[data-framework] .dock-host {
			--dock-divider: rgb(0 0 0 / 0.14);
		}

		html[data-theme='dark'][data-framework] .dock-host {
			--dock-divider: rgb(0 0 0 / 0.4);
		}

		body.docs-route .dock-host > .dock-bevel {
			background: var(--dock-frame);
		}

		body.docs-route .dock-surface {
			--dock-surface: unset;
		}

		body.docs-route .dock-host > .dock-bevel > .dock-shell-fill.dock-bevel-fill {
			background: var(--dock-fill);
		}

		body.docs-route .dock-host > .dock-bevel > .dock-shell-fill.dock-bevel-fill::after {
			content: '';
			pointer-events: none;
			position: absolute;
			inset: 0;
			z-index: 0;
			opacity: 0.45;
			background-image: linear-gradient(
				135deg,
				color-mix(in srgb, var(--framework-dock-tint), transparent 92%) 0%,
				transparent 42%,
				transparent 58%,
				color-mix(in srgb, var(--framework-dock-tint), transparent 94%) 100%
			);
		}

		.dock-host .dock-toolbar .theme-switcher-inline,
		.dock-host .theme-switcher-embedded {
			--theme-switcher-pad: 0.22rem;
			--theme-switcher-track-bg: rgb(0 0 0 / 0.06);
			--theme-switcher-track-ring: rgb(0 0 0 / 0.1);
			--theme-switcher-thumb-bg: rgb(255 255 255 / 0.94);
			--theme-switcher-icon-idle: rgb(0 0 0 / 0.4);
			--theme-switcher-icon-hover: rgb(0 0 0 / 0.62);
			--theme-switcher-icon-active: rgb(0 0 0 / 0.88);
			--theme-switcher-thumb-shadow: 0 2px 8px rgb(0 0 0 / 0.14);
		}

		html[data-theme='dark'] .dock-host .dock-toolbar .theme-switcher-inline,
		html[data-theme='dark'] .dock-host .theme-switcher-embedded {
			--theme-switcher-track-bg: rgb(0 0 0 / 0.38);
			--theme-switcher-track-ring: rgb(0 0 0 / 0.52);
			--theme-switcher-thumb-bg: rgb(255 255 255 / 0.14);
			--theme-switcher-icon-idle: rgb(255 255 255 / 0.42);
			--theme-switcher-icon-hover: rgb(255 255 255 / 0.68);
			--theme-switcher-icon-active: rgb(255 255 255 / 0.92);
			--theme-switcher-thumb-shadow: 0 3px 10px rgb(0 0 0 / 0.42);
		}

		.dock-host .dock-toolbar .theme-switcher-inline .theme-switcher-track--inline,
		.dock-host .theme-switcher-embedded .theme-switcher-track--embedded {
			position: relative;
			display: grid;
			height: 100%;
			width: 100%;
			grid-template-columns: repeat(3, 1fr);
			align-items: center;
			padding: var(--theme-switcher-pad);
			border: none;
			border-radius: 0.55rem;
			background: var(--theme-switcher-track-bg) !important;
			box-shadow: 0 0 0 1px var(--theme-switcher-track-ring);
		}

		.dock-host
			.dock-toolbar
			.theme-switcher-inline
			.theme-switcher-track--inline
			> .theme-switcher-thumb,
		.dock-host .theme-switcher-embedded .theme-switcher-track--embedded > .theme-switcher-thumb {
			--theme-thumb-slot: calc((100% - (2 * var(--theme-switcher-pad))) / 3);
			position: absolute;
			top: var(--theme-switcher-pad);
			bottom: var(--theme-switcher-pad);
			left: calc(var(--theme-switcher-pad) + var(--theme-thumb-index, 0) * var(--theme-thumb-slot));
			z-index: 1;
			width: var(--theme-thumb-slot);
			height: auto;
			box-sizing: border-box;
			pointer-events: none;
			border: none;
			border-radius: 0.55rem;
			background: var(--theme-switcher-thumb-bg) !important;
			box-shadow: var(--theme-switcher-thumb-shadow);
			transition:
				left 280ms cubic-bezier(0.34, 1.4, 0.64, 1),
				background-color 200ms ease,
				box-shadow 200ms ease;
		}

		.dock-host .theme-switcher-embedded .theme-switcher-track--embedded {
			overflow: hidden;
		}

		.dock-host .theme-switcher-embedded .theme-switcher-btn {
			min-height: 0;
			height: 100%;
			padding: 0;
		}

		.dock-host .theme-switcher-btn {
			position: relative;
			z-index: 2;
			display: flex;
			min-width: 0;
			align-items: center;
			justify-content: center;
			border: none;
			background: transparent;
			padding: 0.45rem 0.35rem;
			color: var(
				--theme-switcher-icon-idle,
				color-mix(in lch, var(--app-color-dark), transparent 38%)
			);
			transition: color 160ms ease;
		}

		.dock-host .theme-switcher-btn :global(svg) {
			display: block;
			width: 1.6rem;
			height: 1.6rem;
			flex-shrink: 0;
			margin: auto;
		}

		.dock-host .theme-switcher-btn:hover {
			color: var(
				--theme-switcher-icon-hover,
				color-mix(in lch, var(--app-color-dark), transparent 18%)
			);
		}

		.dock-host .theme-switcher-btn.is-active {
			color: var(--theme-switcher-icon-active, var(--app-color-dark));
		}

		@media (min-width: 768px) {
			body.docs-route .dock-host > .dock-bevel,
			html[data-theme='dark'] body.docs-route .dock-host > .dock-bevel {
				clip-path: none;
				background: transparent;
				overflow: visible;
				isolation: isolate;
			}

			body.docs-route .dock-host > .dock-bevel::before {
				content: '';
				position: absolute;
				inset: 0;
				z-index: 0;
				pointer-events: none;
				background: var(--dock-frame);
				clip-path: polygon(
					var(--bevel-cut) 0%,
					calc(100% - var(--bevel-cut)) 0%,
					100% var(--bevel-cut),
					100% calc(100% - var(--bevel-cut)),
					calc(100% - var(--bevel-cut)) 100%,
					var(--bevel-cut) 100%,
					0% calc(100% - var(--bevel-cut)),
					0% var(--bevel-cut)
				);
			}

			body.docs-route .dock-host > .dock-bevel > .dock-shell-fill.dock-bevel-fill,
			html[data-theme='dark']
				body.docs-route
				.dock-host
				> .dock-bevel
				> .dock-shell-fill.dock-bevel-fill {
				clip-path: none;
				overflow: visible;
				position: relative;
				z-index: 1;
				background: transparent;
			}

			body.docs-route .dock-host > .dock-bevel > .dock-shell-fill.dock-bevel-fill::before {
				content: '';
				position: absolute;
				inset: 0;
				z-index: 0;
				pointer-events: none;
				background: var(--dock-fill);
				clip-path: polygon(
					calc(var(--bevel-cut) + var(--bevel-width)) var(--bevel-width),
					calc(100% - var(--bevel-cut) - var(--bevel-width)) var(--bevel-width),
					calc(100% - var(--bevel-width)) calc(var(--bevel-cut) + var(--bevel-width)),
					calc(100% - var(--bevel-width)) calc(100% - var(--bevel-cut) - var(--bevel-width)),
					calc(100% - var(--bevel-cut) - var(--bevel-width)) calc(100% - var(--bevel-width)),
					calc(var(--bevel-cut) + var(--bevel-width)) calc(100% - var(--bevel-width)),
					var(--bevel-width) calc(100% - var(--bevel-cut) - var(--bevel-width)),
					var(--bevel-width) calc(var(--bevel-cut) + var(--bevel-width))
				);
			}

			body.docs-route .dock-host > .dock-bevel > .dock-shell-fill.dock-bevel-fill::after {
				clip-path: polygon(
					calc(var(--bevel-cut) + var(--bevel-width)) var(--bevel-width),
					calc(100% - var(--bevel-cut) - var(--bevel-width)) var(--bevel-width),
					calc(100% - var(--bevel-width)) calc(var(--bevel-cut) + var(--bevel-width)),
					calc(100% - var(--bevel-width)) calc(100% - var(--bevel-cut) - var(--bevel-width)),
					calc(100% - var(--bevel-cut) - var(--bevel-width)) calc(100% - var(--bevel-width)),
					calc(var(--bevel-cut) + var(--bevel-width)) calc(100% - var(--bevel-width)),
					var(--bevel-width) calc(100% - var(--bevel-cut) - var(--bevel-width)),
					var(--bevel-width) calc(var(--bevel-cut) + var(--bevel-width))
				);
			}

			body.docs-route .dock-toolbar {
				position: relative;
				z-index: 2;
				overflow: visible;
			}

			body.docs-route .dock-zoom {
				overflow: visible;
				align-items: flex-end;
			}

			body.docs-route .dock-shell-fill .dock-zoom > a > .group > button > span {
				transform-origin: bottom center;
			}

			body.docs-route .dock-shell-fill .dock-zoom > a > .group > button > span :global(svg) {
				transform-origin: bottom center;
			}

			body.docs-route .dock-toolbar {
				align-items: flex-end;
			}
		}

		body.docs-route .dock-toolbar .dock-bevel:not(.dock-tooltip),
		body.docs-route .dock-toolbar .dock-bevel-fill:not(.dock-tooltip-label),
		body.docs-route .dock-shell-fill .dock-zoom > a > .group {
			background: transparent !important;
			clip-path: none;
			padding: 0;
		}

		body.docs-route .dock-shell-fill .dock-zoom > a > .group > button {
			background: transparent !important;
			clip-path: none;
			padding: 0;
		}

		body.docs-route .dock-tooltip {
			background: var(--chip-border);
		}

		body.docs-route .dock-tooltip-label {
			background: var(--chip-fill);
			color: var(--chip-label);
		}

		body.docs-route .theme-switcher-standalone .theme-switcher-track--standalone {
			position: relative;
			display: flex;
			padding: 0.25rem 0.35rem;
			border-radius: 0.45rem;
		}

		body.docs-route .theme-switcher-thumb--standalone {
			--theme-thumb-slot: calc((100% - 0.7rem) / 3);
			position: absolute;
			top: 0.35rem;
			bottom: 0.35rem;
			left: calc(0.36rem + var(--theme-thumb-index, 0) * var(--theme-thumb-slot));
			z-index: 1;
			width: var(--theme-thumb-slot);
			pointer-events: none;
			border: none;
			border-radius: 0.45rem;
			background: color-mix(in lch, var(--color-brand), transparent 82%) !important;
			box-shadow: var(
				--theme-switcher-thumb-shadow,
				0 1px 3px color-mix(in lch, var(--app-color-dark), transparent 86%)
			);
			transition: left 280ms cubic-bezier(0.34, 1.4, 0.64, 1);
		}

		body.docs-route .dock-zoom :global(svg),
		body.docs-route .dock-zoom :global(svg *) {
			fill: currentcolor !important;
			color: currentcolor !important;
		}

		.dock-zoom :global(svg) {
			max-width: none !important;
			width: auto !important;
			height: auto !important;
		}

		@media (max-width: 767px) {
			.dock-host {
				--spacing-dock-cut: 0.7rem;
			}

			.dock-surface {
				--dock-elevation-filter: drop-shadow(0 -2px 4px rgb(0 0 0 / 0.14))
					drop-shadow(0 -12px 28px rgb(0 0 0 / 0.22));
			}

			html[data-theme='dark'] .dock-surface {
				--dock-elevation-filter: drop-shadow(0 -3px 6px rgb(0 0 0 / 0.42))
					drop-shadow(0 -14px 32px rgb(0 0 0 / 0.58));
			}

			.dock-mobile-menu {
				overflow: hidden;
			}

			.dock-mobile-menu-body {
				display: flex;
				flex-direction: column;
			}

			.dock-menu-scroll {
				border-bottom: 1px solid var(--dock-divider, var(--color-border));
				padding: 0.65rem 0.85rem 0.85rem;
			}

			.dock-menu-scroll > .flex {
				padding: 0.35rem 0.2rem;
			}

			.dock-host .dock-menu-scroll.docs-sidebar-panel {
				font-size: 13px;
				line-height: 20px;
			}

			.dock-host .dock-menu-scroll .site-kicker {
				margin-bottom: 0.55rem;
				padding-left: 0.35rem;
			}

			.dock-host .dock-menu-scroll nav ul li > a,
			.dock-host .dock-menu-scroll .docs-nav-link {
				display: block;
				padding: 0.45rem 0.85rem;
				font-family: var(--font-mono);
				font-size: 13px;
				font-weight: 600;
				line-height: 20px;
				color: color-mix(in lch, var(--app-color-dark), transparent 12%);
				transition: color 150ms ease;
			}

			.dock-host .dock-menu-scroll nav ul li > a:hover,
			.dock-host .dock-menu-scroll .docs-nav-link:hover {
				color: var(--docs-text, var(--app-color-dark));
			}

			.dock-host .dock-menu-scroll nav ul li .dock-bevel-brand a,
			.dock-host .dock-menu-scroll .docs-nav-link--active {
				padding: 0.5rem 0.95rem;
				font-weight: 800;
				letter-spacing: 0.02em;
				color: var(--chip-label, var(--color-brand));
			}

			.dock-host .dock-menu-scroll .docs-nav-divider {
				margin: 0.85rem 0.35rem;
			}

			.dock-mobile-menu-footer {
				display: flex;
				flex-direction: column;
				gap: 0.65rem;
				padding: 0.85rem 0.65rem 1rem;
			}

			.dock-zoom-embedded {
				display: grid;
				grid-template-columns: repeat(5, minmax(0, 1fr));
				width: 100%;
				gap: 0.25rem;
				padding-inline: 0.25rem;
			}

			.dock-zoom-embedded > a {
				display: flex;
				min-width: 0;
				align-items: stretch;
			}

			.dock-mobile-menu-footer .theme-switcher-embedded {
				--dock-mobile-theme-height: 3.5rem;
				width: 100%;
				height: var(--dock-mobile-theme-height);
				min-height: var(--dock-mobile-theme-height);
				margin-top: 0.15rem;
			}

			.dock-mobile-menu-footer .theme-switcher-embedded .theme-switcher-track--embedded {
				height: 100%;
				min-height: 0;
				place-items: stretch;
			}

			.dock-mobile-menu-footer .theme-switcher-embedded .theme-switcher-btn {
				display: grid;
				place-items: center;
			}

			.dock-mobile-menu-footer .theme-switcher-btn.is-active {
				box-shadow: none;
			}

			html[data-theme='light'] .dock-mobile-menu-footer .theme-switcher-embedded {
				--theme-switcher-track-bg: rgb(0 0 0 / 0.14);
				--theme-switcher-track-ring: rgb(0 0 0 / 0.22);
				--theme-switcher-thumb-bg: rgb(255 255 255 / 0.98);
				--theme-switcher-icon-idle: rgb(0 0 0 / 0.45);
				--theme-switcher-icon-hover: rgb(0 0 0 / 0.68);
				--theme-switcher-icon-active: rgb(0 0 0 / 0.9);
				--theme-switcher-thumb-shadow: 0 2px 8px rgb(0 0 0 / 0.18);
			}

			.dock-menu-scroll .dock-bevel-brand {
				margin-inline: 0.1rem;
			}
		}
	}
</style>
