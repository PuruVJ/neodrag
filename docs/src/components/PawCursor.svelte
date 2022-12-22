<script lang="ts">
	import { get, Writable, writable } from 'svelte/store';
	// @ts-ignore
	import PawIcon from '~icons/mdi/paw';

	let showCustomCursor = false;

	let coordsCursor: {
		x: number;
		y: number;
	};

	function handleMouseMove(e: MouseEvent) {
		coordsCursor ??= { x: 0, y: 0 };

		coordsCursor.x = e.clientX;
		coordsCursor.y = e.clientY;
	}

	function querySelectorAllLive<T extends HTMLElement = HTMLElement>(
		element: HTMLElement,
		selector: string
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
			attributeFilter: ['data-paw-cursor'],
		});

		return result;
	}

	$: pawCursorEls = globalThis.document
		? querySelectorAllLive(
				document.body,
				'[data-paw-cursor="true"], [data-paw-cursor="false"]'
		  )
		: writable([]);

	$: {
		for (const el of $pawCursorEls) {
			let initialCursor = '';
			el.addEventListener(
				'mouseover',
				() => {
					if (el.dataset.pawCursor === 'true') {
						showCustomCursor = true;
						initialCursor = getComputedStyle(el).cursor;
						el.style.cursor = 'none';
					} else {
						showCustomCursor = false;
						initialCursor && (el.style.cursor = initialCursor);
					}
				},
				{ capture: true, passive: true }
			);
			el.addEventListener('mouseout', () => {
				showCustomCursor = false;
				initialCursor && (el.style.cursor = initialCursor);
			});
		}
	}
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div
	class="cursor"
	style:top="{coordsCursor?.y ?? 0}px"
	style:left="{coordsCursor?.x ?? 0}px"
	style:--opacity={showCustomCursor && coordsCursor ? 1 : 0}
>
	<PawIcon style="font-size: 2rem;" />
</div>

<style lang="scss">
	.cursor {
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
			fill: var(--app-color-dark);
		}
	}
</style>
