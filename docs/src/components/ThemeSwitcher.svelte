<script lang="ts">
	import { apply_theme_to_dom, theme } from '$state/user-preferences.svelte';

	function set_theme(preference: 'light' | 'dark' | 'system') {
		theme.preference = preference;
		apply_theme_to_dom(theme.current);
	}
	import SunIcon from '~icons/material-symbols-light/wb-sunny-rounded';
	import SystemIcon from '~icons/heroicons/computer-desktop-20-solid';
	import MoonIcon from '~icons/solar/moon-bold';

	type Props = {
		thumbnail?: boolean;
		onclick?: () => void;
		embedded?: boolean;
	};

	const { thumbnail = false, onclick, embedded = false }: Props = $props();

	const ICONS = {
		light: SunIcon,
		dark: MoonIcon,
		system: SystemIcon,
	};
	const SelectedIcon = $derived(ICONS[theme.preference]);

	const btn =
		'relative z-[2] flex flex-1 justify-center bg-transparent p-2 text-[color-mix(in_lch,var(--app-color-dark),transparent_90%)] transition-[color] duration-200 hover:text-[color-mix(in_lch,var(--app-color-dark),transparent_70%)] [&_svg]:block [&_svg]:!w-[1.6rem] [&_svg]:shrink-0';
</script>

<div
	class={[
		embedded
			? 'relative mx-2 mb-2 h-12'
			: 'dock-angular-bevel dock-angular-bevel--sm dock-surface relative m-1 h-12',
	]}
>
	<div
		class={[
			embedded
				? 'relative flex bg-transparent px-1 pb-1'
				: 'dock-angular-bevel__fill relative flex bg-[color-mix(in_lch,var(--app-color-dark),transparent_96%)] px-1',
			thumbnail && '!bg-transparent',
		]}
	>
	{#if thumbnail}
		<button type="button" class={btn} {onclick}>
			<SelectedIcon />
		</button>
	{:else}
		<div
			class={[
				'pointer-events-none absolute top-[0.35rem] left-[0.36rem] z-[1] h-[calc(100%-0.7rem)] w-[calc(33.333%-0.22rem)] bg-[color-mix(in_lch,var(--color-brand),transparent_82%)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [clip-path:polygon(0.35rem_0,calc(100%-0.35rem)_0,100%_0.35rem,100%_calc(100%-0.35rem),calc(100%-0.35rem)_100%,0.35rem_100%,0_calc(100%-0.35rem),0_0.35rem)]',
				theme.preference === 'light' && 'translate-x-0',
				theme.preference === 'system' && 'translate-x-full',
				theme.preference === 'dark' && 'translate-x-[200%]',
			]}
		></div>

		<button
			type="button"
			class={[btn, theme.preference === 'light' && 'text-[color-mix(in_lch,var(--app-color-dark),transparent_50%)]']}
			onclick={() => {
				set_theme('light');
				onclick?.();
			}}
		>
			<SunIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
		<button
			type="button"
			class={[btn, theme.preference === 'system' && 'text-[color-mix(in_lch,var(--app-color-dark),transparent_50%)]']}
			onclick={() => {
				set_theme('system');
				onclick?.();
			}}
		>
			<SystemIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
		<button
			type="button"
			class={[btn, theme.preference === 'dark' && 'text-[color-mix(in_lch,var(--app-color-dark),transparent_50%)]']}
			onclick={() => {
				set_theme('dark');
				onclick?.();
			}}
		>
			<MoonIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
	{/if}
	</div>
</div>
