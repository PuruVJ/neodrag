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
		inline?: boolean;
	};

	const { thumbnail = false, onclick, embedded = false, inline = false }: Props = $props();

	const thumb_index = $derived(
		theme.preference === 'light' ? 0 : theme.preference === 'system' ? 1 : 2,
	);

	const ICONS = {
		light: SunIcon,
		dark: MoonIcon,
		system: SystemIcon,
	};
	const SelectedIcon = $derived(ICONS[theme.preference]);

</script>

<div
	class={[
		embedded && 'theme-switcher-embedded relative w-full shrink-0',
		inline && 'theme-switcher-inline relative h-14 w-[9.25rem] shrink-0',
		!embedded &&
			!inline &&
			'theme-switcher-standalone dock-bevel dock-bevel-sm dock-surface relative m-1 h-12',
	]}
	style:--theme-thumb-index={thumbnail ? undefined : thumb_index}
>
	<div
		class={[
			'theme-switcher-track',
			embedded && 'theme-switcher-track--embedded',
			inline && 'theme-switcher-track--inline',
			!embedded && !inline && 'dock-bevel-fill theme-switcher-track--standalone',
			thumbnail && 'theme-switcher-track--thumbnail',
		]}
	>
		{#if (inline || embedded) && !thumbnail}
			<div class="theme-switcher-thumb" aria-hidden="true"></div>
		{/if}

		{#if thumbnail}
			<button type="button" class="theme-switcher-btn" {onclick}>
				<SelectedIcon />
			</button>
		{:else}
			{#if !inline && !embedded}
				<div class="theme-switcher-thumb theme-switcher-thumb--standalone" aria-hidden="true"></div>
			{/if}

			<button
				type="button"
				class={['theme-switcher-btn', theme.preference === 'light' && 'is-active']}
				onclick={() => {
					set_theme('light');
					onclick?.();
				}}
			>
				<SunIcon width="1.6rem" height="1.6rem" fill="currentColor" />
			</button>
			<button
				type="button"
				class={['theme-switcher-btn', theme.preference === 'system' && 'is-active']}
				onclick={() => {
					set_theme('system');
					onclick?.();
				}}
			>
				<SystemIcon width="1.6rem" height="1.6rem" fill="currentColor" />
			</button>
			<button
				type="button"
				class={['theme-switcher-btn', theme.preference === 'dark' && 'is-active']}
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
