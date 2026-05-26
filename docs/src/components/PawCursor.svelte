<script lang="ts">
	import type { ThemeValue } from '$state/user-preferences.svelte';
	import { browser } from '$helpers/utils';
	import { on } from 'svelte/events';
	import PawIcon from '~icons/mdi/paw';

	let showCustomCursor = $state(false);
	let cursorColor: ThemeValue['current'] | undefined = $state('dark');
	let coordsCursor = $state({ x: 0, y: 0 });
	let mounted = $state(false);

	const is_touch_device =
		typeof globalThis.matchMedia === 'function' &&
		globalThis.matchMedia('(hover: none)').matches;

	function handle_mouse_move(e: MouseEvent) {
		if (is_touch_device) return;
		coordsCursor.x = e.clientX;
		coordsCursor.y = e.clientY;
	}

	function bind_paw_targets() {
		const cleanups: (() => void)[] = [];
		const els = document.querySelectorAll<HTMLElement>(
			'[data-paw-cursor="true"], [data-paw-cursor="false"]',
		);

		for (const el of els) {
			let initial_cursor = '';

			const on_over = (e: MouseEvent) => {
				e.stopPropagation();

				if (el.dataset.pawCursor === 'true') {
					showCustomCursor = true;

					if (el.dataset.pawColor) {
						cursorColor = el.dataset.pawColor as ThemeValue['current'];
					}

					initial_cursor = getComputedStyle(el).cursor;
					el.style.cursor = 'none';
				} else {
					showCustomCursor = false;
					if (initial_cursor) el.style.cursor = initial_cursor;
				}
			};

			const on_out = () => {
				showCustomCursor = false;
				if (initial_cursor) el.style.cursor = initial_cursor;
				cursorColor = undefined;
			};

			el.addEventListener('mouseover', on_over, { capture: true, passive: true });
			el.addEventListener('mouseout', on_out, { passive: true });

			cleanups.push(() => {
				el.removeEventListener('mouseover', on_over, { capture: true });
				el.removeEventListener('mouseout', on_out);
			});
		}

		return cleanups;
	}

	$effect(() => {
		if (!browser || is_touch_device) return;

		mounted = true;

		let paw_cleanups = bind_paw_targets();

		const observer = new MutationObserver(() => {
			for (const cleanup of paw_cleanups) cleanup();
			paw_cleanups = bind_paw_targets();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['data-paw-cursor', 'data-paw-color'],
		});

		const stop_move = on(window, 'mousemove', handle_mouse_move, { passive: true });

		return () => {
			mounted = false;
			observer.disconnect();
			for (const cleanup of paw_cleanups) cleanup();
			stop_move();
		};
	});
</script>

<div
	class="cursor"
	style:top="{coordsCursor.y}px"
	style:left="{coordsCursor.x}px"
	style:--opacity={showCustomCursor ? 1 : 0}
	style:--color="var(--app-color-{cursorColor ?? 'dark'})"
	style:display={mounted ? 'block' : 'none'}
>
	<PawIcon style="font-size: 2rem;" />
</div>

<style>
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
