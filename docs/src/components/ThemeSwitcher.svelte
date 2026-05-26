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
		'relative z-[2] flex flex-1 justify-center border-2 border-transparent bg-transparent p-2 text-[color-mix(in_lch,var(--app-color-dark),transparent_90%)] transition-[color,border-color] duration-200 hover:text-[color-mix(in_lch,var(--app-color-dark),transparent_70%)] [&_svg]:block [&_svg]:!w-[1.6rem] [&_svg]:shrink-0';
</script>

<div
	class={[
		'dock-angular-chip dock-surface relative flex h-12 border-2 border-[var(--dock-border)] bg-[color-mix(in_lch,var(--app-color-dark),transparent_94%)]',
		embedded ? 'm-0 px-1 pb-1' : 'm-1 px-1',
		thumbnail && 'bg-transparent',
	]}
>
	{#if thumbnail}
		<button type="button" class={btn} {onclick}>
			<SelectedIcon />
		</button>
	{:else}
		<div
			class={[
				'dock-angular-chip pointer-events-none absolute top-[0.3rem] left-[0.32rem] z-[1] h-[calc(100%-0.6rem)] w-[calc(33.333%-0.2rem)] border border-[color-mix(in_lch,var(--color-brand),transparent_55%)] bg-[color-mix(in_lch,var(--color-brand),transparent_82%)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
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
