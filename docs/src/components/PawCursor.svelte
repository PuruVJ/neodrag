<script lang="ts">
	import type { Theme } from '$state/user-preferences.svelte.ts';
	import { IsMounted } from 'runed';
	import { on } from 'svelte/events';
	import { get, type Writable, writable } from 'svelte/store';
	import PawIcon from '~icons/mdi/paw';

	let showCustomCursor = $state(false);
	let cursorColor: Theme | undefined = $state('dark');

	let coordsCursor = $state({ x: 0, y: 0 });

	let isTouchDevice = globalThis.matchMedia('(hover: none)').matches;

	const mounted = new IsMounted();

	function handleMouseMove(e: MouseEvent) {
		if (isTouchDevice) return;

		coordsCursor ??= { x: 0, y: 0 };

		coordsCursor.x = e.clientX;
		coordsCursor.y = e.clientY;
	}

	function querySelectorAllLive<T extends HTMLElement = HTMLElement>(
		element: HTMLElement,
		selector: string,
	): Writable<T[]> {
		// Initialize results with current nodes.
		const result = writable(Array.from<T>(element.querySelectorAll(selector)));

		// Create observer instance.
		const observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (mutation.type === 'attributes' || mutation.type === 'childList') {
					if ((mutation.target as HTMLElement).matches?.(selector))
						result.set([...get(result), mutation.target as T]);
				}
			});
		});

		// Set up observer.
		observer.observe(element, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['data-paw-cursor', 'data-paw-color'],
		});

		return result;
	}

	let pawCursorEls = $derived(
		globalThis.document && !isTouchDevice
			? querySelectorAllLive(
					document.body,
					'[data-paw-cursor="true"], [data-paw-cursor="false"]',
				)
			: writable([]),
	);

	$effect(() => {
		if (isTouchDevice) return;

		for (const el of $pawCursorEls) {
			let initialCursor = '';
			el.addEventListener(
				'mouseover',
				(e) => {
					e.stopPropagation();

					if (el.dataset.pawCursor === 'true') {
						showCustomCursor = true;

						if (el.dataset.pawColor) {
							cursorColor = el.dataset.pawColor as Theme;
						}

						initialCursor = getComputedStyle(el).cursor;
						el.style.cursor = 'none';
					} else {
						showCustomCursor = false;
						initialCursor && (el.style.cursor = initialCursor);
					}
				},
				{ capture: true, passive: true },
			);
			el.addEventListener(
				'mouseout',
				() => {
					showCustomCursor = false;
					initialCursor && (el.style.cursor = initialCursor);

					cursorColor = undefined;
				},
				{ passive: true },
			);
		}
	});

	$effect(() => {
		return on(window, 'mousemove', handleMouseMove, { passive: true });
	});
</script>

<div
	class="cursor"
	style:top="{coordsCursor?.y ?? 0}px"
	style:left="{coordsCursor?.x ?? 0}px"
	style:--opacity={showCustomCursor && coordsCursor ? 1 : 0}
	style:--color="var(--app-color-{cursorColor ?? 'dark'})"
	style:display={mounted.current ? 'block' : 'none'}
>
	<PawIcon style="font-size: 2rem;" />
</div>

<style lang="scss">
	.cursor {
		--color: var(--app-color-dark);

		display: none;

		position: fixed;
		top: 0;
		left: 0;

		transform: translate3d(-50%, -50%, 0);

		opacity: var(--opacity);

		pointer-events: none;

		z-index: 10000;

		filter: drop-shadow(0px 4px 4px #00000059);

		:global(svg) {
			min-width: 2rem;
			width: 2rem;
		}

		:global(svg path) {
			fill: var(--color);
		}

		@media (hover: none) {
			display: none;
		}
	}
</style>
