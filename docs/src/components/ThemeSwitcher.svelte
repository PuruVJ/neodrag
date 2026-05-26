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
</script>

<div
	class={[
		'theme-switcher',
		'dock-angular-chip',
		thumbnail && 'thumbnail',
		embedded && 'embedded',
	]}
>
	{#if thumbnail}
		<button class="theme-button" {onclick}>
			<SelectedIcon />
		</button>
	{:else}
		<!-- Sliding indicator with conditional classes -->
		<div
			class="indicator"
			class:indicator-light={theme.preference === 'light'}
			class:indicator-system={theme.preference === 'system'}
			class:indicator-dark={theme.preference === 'dark'}
		></div>

		<button
			class="theme-button light"
			class:active={theme.preference === 'light'}
			onclick={() => {
				set_theme('light');
				onclick?.();
			}}
		>
			<SunIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
		<button
			class="theme-button system"
			class:active={theme.preference === 'system'}
			onclick={() => {
				set_theme('system');
				onclick?.();
			}}
		>
			<SystemIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
		<button
			class="theme-button dark"
			class:active={theme.preference === 'dark'}
			onclick={() => {
				set_theme('dark');
				onclick?.();
			}}
		>
			<MoonIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
	{/if}
</div>

<style>
	.theme-switcher {
		position: relative;
		display: flex;
		height: 3rem;
		padding: 0 0.28rem;
		margin: 0.2rem;

		background-color: color-mix(in lch, var(--app-color-dark), transparent 94%);
		border: 2px solid var(--dock-border);

		&.embedded {
			/* Remove margins and adjust padding */
			margin: 0;
			padding: 0 0.28rem 0.2rem 0.28rem; /* Move margin into padding */

			.theme-button {
				/* Remove margin from buttons in embedded mode */
				margin: 0;
				padding: 0.75rem 0.5rem; /* Compensate with padding */
			}
		}

		&.thumbnail {
			background-color: transparent;
		}
	}

	.indicator {
		position: absolute;
		top: 0.3rem;
		left: 0.32rem;
		width: calc(33.333% - 0.2rem);
		height: calc(100% - 0.6rem);
		background-color: color-mix(in lch, var(--app-color-primary), transparent 82%);
		border: 1px solid color-mix(in lch, var(--app-color-primary), transparent 55%);
		pointer-events: none;
		z-index: 1;
		transform: translateX(0);
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		clip-path: polygon(
			0.3rem 0%,
			calc(100% - 0.3rem) 0%,
			100% 0.3rem,
			100% calc(100% - 0.3rem),
			calc(100% - 0.3rem) 100%,
			0.3rem 100%,
			0% calc(100% - 0.3rem),
			0% 0.3rem
		);
	}

	/* Indicator position classes */
	.indicator-light {
		transform: translateX(0);
	}

	.indicator-system {
		transform: translateX(100%);
	}

	.indicator-dark {
		transform: translateX(200%);
	}

	.theme-button {
		position: relative;
		z-index: 2;
		flex: 1;
		padding: 0.5rem;
		margin: 0.25rem 0;
		background: transparent;
		border: 2px solid transparent;
		display: flex;
		justify-content: center;
		cursor: pointer;
		color: color-mix(in lch, var(--app-color-dark), transparent 90%);
		transition:
			color 0.2s ease,
			border-color 75ms ease;

		:global {
			svg {
				width: 1.6rem !important;
				flex-shrink: 0;
				display: block;
			}
		}
	}

	.theme-button:hover {
		color: color-mix(in lch, var(--app-color-dark), transparent 70%);
	}

	.theme-button.active {
		color: color-mix(in lch, var(--app-color-dark), transparent 50%);
	}
</style>
