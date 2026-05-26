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
	class="dock-host pointer-events-none fixed bottom-4 left-0 z-[1000] flex h-24 w-full items-end justify-center gap-[clamp(2rem,10vw,8rem)] p-1.5 max-md:bottom-0 max-md:h-16 max-md:justify-stretch max-md:gap-0 max-md:p-0"
>
	<div
		class={[
			'dock-angular-bevel dock-surface pointer-events-auto relative h-full w-full overflow-visible shadow-[var(--dock-shadow)] max-md:dock-angular-bevel--bar md:w-auto',
		]}
		{@attach dockDrag.attachment}
		{@attach interact_outside(() => menu_view.close())}
	>
		<div
			class={[
				'dock-angular-bevel__fill relative flex flex-col items-end overflow-visible backdrop-blur-[14px] backdrop-saturate-[1.08] before:pointer-events-none before:absolute before:inset-0 before:bg-[linear-gradient(135deg,color-mix(in_lch,var(--color-brand),transparent_94%)_0%,transparent_40%,transparent_60%,color-mix(in_lch,var(--color-brand),transparent_96%)_100%)] before:opacity-35 before:content-[""]',
				menu_view.open ? 'max-md:p-0' : 'p-1.5',
			]}
		>
			<div class="hidden w-full max-md:block">
				{#if menu_view.open}
					<div class="w-full" transition:slide={{ duration: 400, easing: expoOut }}>
						<div class="max-h-[48vh] overflow-y-auto">
							<Nav compact {pathname} {nav_list} onclick={() => menu_view.toggle()} />
						</div>
						<div>{@render framework_selector(true)}</div>
						<div><ThemeSwitcher embedded /></div>
					</div>
				{/if}
			</div>

			<div class="relative z-[1] flex h-full w-full max-md:h-full">
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
					{@render github()}
					<div class="dock-angular-bevel dock-angular-bevel--sm">
						<button
							type="button"
							class="{dock_btn} dock-angular-bevel__fill w-12 [&_svg]:!w-7"
							onclick={() => menu_view.toggle()}
						>
							<MenuIcon />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

{#snippet github()}
	<div class="dock-angular-bevel dock-angular-bevel--sm h-full">
		<a
			href="https://github.com/PuruVJ/neodrag"
			target="_blank"
			rel="external"
			class="{dock_btn} dock-angular-bevel__fill unstyled !text-[color-mix(in_lch,var(--app-color-dark),transparent_25%)] [&_svg]:h-auto [&_svg]:w-8 [&_svg]:max-md:w-7 [&_path]:!text-current [&_g]:!text-current [&_svg]:!text-current"
		>
			<GithubIcon />
		</a>
	</div>
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
