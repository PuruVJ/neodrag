<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
	import { browser } from '$helpers/utils';
	import type { DragBoundsCoords } from '@neodrag/svelte';
	import { throttle } from 'throttle-debounce';

	let container_el: HTMLElement | undefined = $state();
	let first_scrollable_parent = $state<Node>();
	let main_scrollable_ancestor = $state<Node>();

	let supposed_bounds: DragBoundsCoords = {
		top: 60,
		left: 20,
		bottom: 35,
		right: 30,
	};

	let computedBounds = $state<Partial<DragBoundsCoords>>();

	function getScrollParent(node: HTMLElement): Node | undefined {
		if (node == null) {
			return undefined;
		}

		if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth) {
			return node;
		} else {
			return getScrollParent(node.parentNode as HTMLElement);
		}
	}

	function setComputedBounds() {
		if (!container_el || !first_scrollable_parent || !main_scrollable_ancestor) return;

		const { top, left, bottom, right } = container_el.getBoundingClientRect();

		const computedRight = globalThis.innerWidth - right;
		const computedBottom = globalThis.innerHeight - bottom;

		computedBounds = {
			top: top + supposed_bounds.top,
			left: left + supposed_bounds.left,
			bottom: computedBottom + supposed_bounds.bottom,
			right: computedRight + supposed_bounds.right,
		};
	}

	$effect(() => {
		container_el;

		if (browser) setComputedBounds();
	});

	const debouncedFn = throttle(100, setComputedBounds);

	$effect(() => {
		if (browser && container_el) {
			first_scrollable_parent = getScrollParent(container_el!);
			main_scrollable_ancestor = getScrollParent(
				first_scrollable_parent?.parentNode as HTMLElement,
			);

			first_scrollable_parent?.addEventListener('scroll', debouncedFn, {
				passive: true,
			});
			main_scrollable_ancestor?.addEventListener('scroll', debouncedFn, {
				passive: true,
			});

			globalThis?.addEventListener('resize', debouncedFn, {
				passive: true,
			});
		}
	});

	$effect(() => () => {
		first_scrollable_parent?.removeEventListener('scroll', debouncedFn);
		main_scrollable_ancestor?.removeEventListener('scroll', debouncedFn);

		if (browser) window?.removeEventListener('resize', debouncedFn);
	});
</script>

<OptionsDemoBase bind:containerEl={container_el} options={{ bounds: computedBounds }} size="10rem">
	Limited to:
	<code>
		top: {supposed_bounds.top}
		<br />
		left: {supposed_bounds.left}
		<br />
		bottom: {supposed_bounds.bottom}
		<br />
		right: {supposed_bounds.right}
	</code>

	{#snippet caption()}
		Bounded by these coordinates from the window's edges.
	{/snippet}
</OptionsDemoBase>
