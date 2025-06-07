<script>
	import { theme } from '$state/user-preferences.svelte';
	import SunIcon from '~icons/line-md/sunny-outline';
	import SystemIcon from '~icons/heroicons/computer-desktop-20-solid';
	import MoonIcon from '~icons/line-md/moon-simple';
</script>

<div class="theme-switcher">
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
		onclick={() => (theme.preference = 'light')}
	>
		<SunIcon fill="currentColor" />
	</button>
	<button
		class="theme-button system"
		class:active={theme.preference === 'system'}
		onclick={() => (theme.preference = 'system')}
	>
		<SystemIcon fill="currentColor" />
	</button>
	<button
		class="theme-button dark"
		class:active={theme.preference === 'dark'}
		onclick={() => (theme.preference = 'dark')}
	>
		<MoonIcon fill="currentColor" />
	</button>
</div>

<style>
	.theme-switcher {
		position: relative;
		display: flex;
		height: 90%;
		padding: 0 0.28rem;
		margin-block: 0.2rem;
		margin-left: 0.2rem;
		margin-right: 0.2rem;

		font-size: 1.2rem;

		background-color: color-mix(in lch, var(--app-color-dark), transparent 95%);
		border-radius: 0.5rem;
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
		cursor: pointer;

		color: color-mix(in lch, var(--app-color-dark), transparent 90%);
		transition: color 0.2s ease;
	}

	.theme-button:hover {
		color: color-mix(in lch, var(--app-color-dark), transparent 70%);
	}

	.theme-button.active {
		color: color-mix(in lch, var(--app-color-dark), transparent 50%);
	}
</style>
