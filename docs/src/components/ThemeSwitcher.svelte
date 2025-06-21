<script lang="ts">
	import { theme } from '$state/user-preferences.svelte';
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

<div class={['theme-switcher', thumbnail && 'thumbnail', embedded && 'embedded']}>
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
				theme.preference = 'light';
				onclick?.();
			}}
		>
			<SunIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
		<button
			class="theme-button system"
			class:active={theme.preference === 'system'}
			onclick={() => {
				theme.preference = 'system';
				onclick?.();
			}}
		>
			<SystemIcon width="1.6rem" height="1.6rem" fill="currentColor" />
		</button>
		<button
			class="theme-button dark"
			class:active={theme.preference === 'dark'}
			onclick={() => {
				theme.preference = 'dark';
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

		background-color: color-mix(in lch, var(--app-color-dark), transparent 95%);
		border-radius: 0.5rem;

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
		top: 0.25rem;
		left: 0.28rem;
		width: calc(33.333% - 0.187rem);
		height: calc(100% - 0.5rem);
		background-color: color-mix(in lch, var(--app-color-dark), transparent 85%);
		border-radius: 0.25rem;
		pointer-events: none;
		z-index: 1;
		transform: translateX(0);
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
		border-radius: 0.25rem;
		margin: 0.25rem 0;
		background: transparent;
		border: none;
		display: flex;
		justify-content: center;
		cursor: pointer;

		color: color-mix(in lch, var(--app-color-dark), transparent 90%);
		transition: color 0.2s ease;

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
