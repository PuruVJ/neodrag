<script module lang="ts">
	const thresholds = Array.from({ length: 101 }, (_, i) => i * 0.01);
	let instance: IntersectionObserver | null;
	const callbacks = new Map<Element, (entry: IntersectionObserverEntry) => void>();

	const attach =
		(cb: (entry: IntersectionObserverEntry) => void): Attachment =>
		(node) => {
			callbacks.set(
				node,
				untrack(() => cb),
			);

			instance ??= new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => callbacks.get(entry.target)?.(entry));
				},
				{ threshold: thresholds },
			);

			instance.observe(node);

			return () => {
				callbacks.delete(node);
				instance?.unobserve(node);
			};
		};
</script>

<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	type Props = {
		title?: string;
		unstyled?: boolean;
		unscaled?: boolean;

		heading?: Snippet;
		children?: Snippet;
	};

	const { title, heading, children, unstyled = false, unscaled = false }: Props = $props();

	const INITIAL_SCALE = unscaled ? 1 : 0.8;
	const INITIAL_OPACITY = unscaled ? 1 : 0.7;

	let scale = $state(INITIAL_SCALE);
	let opacity = $state(INITIAL_OPACITY);
</script>

<section
	class={['feature', !unstyled && 'styled', unscaled && 'unscaled']}
	{@attach attach((entry) => {
		if (unscaled) return;

		scale = INITIAL_SCALE + 0.2 * entry.intersectionRatio;
		opacity = INITIAL_OPACITY + 0.3 * entry.intersectionRatio;
	})}
>
	<div style:scale style:opacity>
		{#if title}
			<h2>{title}</h2>
		{:else}
			{@render heading?.()}
		{/if}

		<div class="content">
			{@render children?.()}
		</div>
	</div>
</section>

<style>
	.feature {
		min-height: 85dvh;
		display: flex;
		box-sizing: border-box;
		max-width: 100dvw;
		scroll-snap-align: start;
		scroll-snap-stop: always;

		& > div {
			flex: 1;
			width: 100%;
		}
	}

	.feature.styled {
		& > div {
			background-color: color-mix(in lch, var(--app-color-dark), transparent 98%);

			border-radius: 1rem;
			padding: 2rem;

			border: solid 1px color-mix(in lch, var(--app-color-dark), transparent 80%);

			@media (max-width: 1223px) {
				padding: 1rem;
			}
		}
	}

	h2 {
		margin-top: 0;
	}
</style>
