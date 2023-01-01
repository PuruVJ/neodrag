<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
	import { browser } from '$helpers/utils';
	import type { DragBoundsCoords } from '@neodrag/svelte';
	import { onDestroy } from 'svelte';
	import { throttle } from 'throttle-debounce';

	let containerEl: HTMLElement | undefined;
	let firstScrollableParent: Node | null;
	let mainScrollableAncestor: Node | null;

	let supposedBounds: DragBoundsCoords = {
		top: 60,
		left: 20,
		bottom: 35,
		right: 30,
	};

	let computedBounds: Partial<DragBoundsCoords>;

	function getScrollParent(node: HTMLElement): Node | null {
		if (node == null) {
			return null;
		}

		if (
			node.scrollHeight > node.clientHeight ||
			node.scrollWidth > node.clientWidth
		) {
			return node;
		} else {
			return getScrollParent(node.parentNode as HTMLElement);
		}
	}

	function setComputedBounds() {
		if (!containerEl || !firstScrollableParent || !mainScrollableAncestor)
			return;

		const { top, left, bottom, right } = containerEl.getBoundingClientRect();

		const computedRight = globalThis.innerWidth - right;
		const computedBottom = globalThis.innerHeight - bottom;

		computedBounds = {
			top: top + supposedBounds.top,
			left: left + supposedBounds.left,
			bottom: computedBottom + supposedBounds.bottom,
			right: computedRight + supposedBounds.right,
		};
	}

	$: {
		containerEl;

		if (browser) setComputedBounds();
	}

	const debouncedFn = throttle(100, setComputedBounds);

	$: if (browser && containerEl) {
		firstScrollableParent = getScrollParent(containerEl!);
		mainScrollableAncestor = getScrollParent(
			firstScrollableParent?.parentNode as HTMLElement
		);

		firstScrollableParent?.addEventListener('scroll', debouncedFn, {
			passive: true,
		});
		mainScrollableAncestor?.addEventListener('scroll', debouncedFn, {
			passive: true,
		});

		globalThis?.addEventListener('resize', debouncedFn, {
			passive: true,
		});
	}

	onDestroy(() => {
		firstScrollableParent?.removeEventListener('scroll', debouncedFn);
		mainScrollableAncestor?.removeEventListener('scroll', debouncedFn);

		if (browser) window?.removeEventListener('resize', debouncedFn);
	});
</script>

<OptionsDemoBase
	bind:containerEl
	options={{ bounds: computedBounds }}
	size="10rem"
>
	Limited to:
	<code>
		top: {supposedBounds.top}
		<br />
		left: {supposedBounds.left}
		<br />
		bottom: {supposedBounds.bottom}
		<br />
		right: {supposedBounds.right}
	</code>

	<svelte:fragment slot="caption">
		Bounded by these coordinates from the window's edges.
	</svelte:fragment>
</OptionsDemoBase>
