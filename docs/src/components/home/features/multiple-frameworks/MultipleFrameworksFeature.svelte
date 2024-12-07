<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import { copy } from 'svelte-copy';
	import { cubicOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import IconCopyToClipboard from '~icons/material-symbols/content-copy-outline-rounded';
	import IconCopyToClipboardFilled from '~icons/material-symbols/content-copy-rounded';
	import FrameworkPolygon from './FrameworkPolygon.svelte';

	let selected_framework: Framework = $state('svelte');

	let copied = $state(false);

	$effect(() => {
		if (copied === true) {
			setTimeout(() => {
				copied = false;
			}, 1000);
		}
	});
</script>

<div class="intro">
	<h2>Multi-framework</h2>
	<p>
		One tool, endless possibilities: integrate with Svelte, Vue, React, Solid,
		and more. <br /><br />
		<span style="color: hsla(var(--app-color-dark-hsl), 0.8)"
			>Core logic is implemented only once, so you can use Neodrag in different
			frameworks, and get the same predictible behavior</span
		>
	</p>

	<br /><br />

	<code>
		npm install @neodrag/
		<span style="position: relative;">
			{#key selected_framework}
				<span
					style="position: absolute"
					style:color="var(--app-color-brand-{selected_framework})"
					in:fly={{ duration: 300, delay: 150, y: -20 }}
					out:fly={{ duration: 300, y: 20 }}>{@html selected_framework}</span
				>
			{/key}
		</span>

		<button
			class="copy-button"
			class:copied
			disabled={copied}
			use:copy={{
				text: `npm install @neodrag/${selected_framework}`,
				onCopy: () => (copied = true),
			}}
		>
			<!-- {#key copied} -->
			<div>
				{#if copied}
					<span transition:fade={{ easing: cubicOut }}>
						<IconCopyToClipboardFilled />
					</span>
				{:else}
					<span transition:fade={{ easing: cubicOut }}>
						<IconCopyToClipboard />
					</span>
				{/if}
			</div>
			<!-- {/key} -->
		</button>
	</code>
</div>

<div>
	<FrameworkPolygon
		onselect={({ framework }) => (selected_framework = framework)}
	/>
</div>

<style lang="scss">
	@import '../feature-box';

	.intro {
		display: grid;
		align-content: center;
	}

	h2 {
		margin-top: 0;
	}

	p {
		@include paragraph();
	}

	code {
		position: relative;

		background-color: transparent;

		font-size: clamp(1.1rem, 3vw, 2rem);
		color: hsla(var(--app-color-dark-hsl), 0.8);

		border: 1px solid hsla(var(--app-color-dark-hsl), 0.2);

		width: max-content;
		padding-right: 7em;
	}

	.copy-button {
		position: absolute;
		top: 0;
		right: 0;

		display: grid;
		place-items: center;

		background-color: transparent;

		height: 100%;

		--svg-opacity: 0.5;

		div {
			display: grid;
			place-items: center;
			grid-template-columns: 1fr;
			grid-template-rows: 1fr;

			height: 100%;
			width: 1.1em;

			span {
				grid-column: 1 / span 1;
				grid-row: 1 / span 1;
			}

			& > :global(svg) {
				min-width: 1.1em;
				height: auto;
			}
		}

		:global(svg path) {
			fill: hsla(var(--app-color-dark-hsl), var(--svg-opacity));

			transition: fill 200ms ease;
		}

		&:active {
			--svg-opacity: 0.8;
		}

		&.copied {
			--svg-opacity: 1;
		}
	}
</style>
