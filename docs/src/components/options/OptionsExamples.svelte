<script lang="ts">
	import { inview } from 'svelte-inview';

	import PrevArrowIcon from '~icons/material-symbols/arrow-back-rounded';
	import NextArrowIcon from '~icons/material-symbols/arrow-forward-rounded';

	let prevNavButtonVisible = false;
	let nextNavButtonVisible = false;

	let optionsExamplesContainerEl: HTMLElement;
	let slotParent: HTMLDivElement;

	function scroll(direction: 'prev' | 'next') {
		const numChildren = slotParent.children.item(0)!.children.length;
		const scrollWidth = optionsExamplesContainerEl.scrollWidth;

		const distanceToScroll = scrollWidth / numChildren;

		const finalScrollVal = distanceToScroll * (direction === 'prev' ? -1 : 1);

		optionsExamplesContainerEl.scrollBy({ left: finalScrollVal, behavior: 'smooth' });
	}
</script>

<section class="container">
	<button
		class="nav-button prev"
		class:visible={prevNavButtonVisible}
		on:click={() => scroll('prev')}
	>
		<PrevArrowIcon />
	</button>

	<section class="container options-examples" bind:this={optionsExamplesContainerEl}>
		<span
			class="hider prev"
			use:inview={{ threshold: 0.01 }}
			on:change={(e) => (prevNavButtonVisible = !e.detail.inView)}
		/>

		<!-- Element needed for astro bug, astro puts this at the end of `.container` rather than at the right place -->
		<div bind:this={slotParent} style="display: contents;">
			<slot />
		</div>

		<span
			class="hider next"
			use:inview={{ threshold: 0.01 }}
			on:change={(e) => (nextNavButtonVisible = !e.detail.inView)}
		/>
	</section>

	<button
		class="nav-button next"
		class:visible={nextNavButtonVisible}
		on:click={() => scroll('next')}
	>
		<NextArrowIcon />
	</button>
</section>

<style lang="scss">
	.container {
		position: relative;
	}

	.options-examples {
		display: grid;
		grid-template-rows: 1fr;
		grid-template-columns: repeat(auto-fill, minmax(auto, 600px));
		grid-auto-flow: column;
		grid-auto-columns: minmax(auto, 600px);
		gap: 2rem;

		width: auto;

		padding: 2rem;
		margin: 1rem 0;
		margin-left: 0rem;

		overflow-x: auto;
		overscroll-behavior-x: none;
		scroll-snap-type: x mandatory;
		scroll-padding-left: 4rem;
		scroll-snap-stop: always;
	}

	.nav-button {
		--scale: 0;

		position: absolute;
		top: 50%;
		z-index: 1;

		display: grid;
		place-items: center;

		background-color: var(--app-color-dark);

		height: 4rem;
		width: 4rem;

		border-radius: 50%;
		box-shadow: 0px 3px 5px -1px rgb(0 0 0 / 20%), 0px 6px 10px 0px rgb(0 0 0 / 14%),
			0px 1px 18px 0px rgb(0 0 0 / 12%);

		transform: translateY(-50%) scale3d(var(--scale), var(--scale), 1);

		transition: transform 0.2s ease-in-out;

		&:hover {
			box-shadow: 0px 5px 5px -3px rgb(0 0 0 / 20%), 0px 8px 10px 1px rgb(0 0 0 / 14%),
				0px 3px 14px 2px rgb(0 0 0 / 12%);
		}

		&:active {
			box-shadow: 0px 7px 8px -4px rgb(0 0 0 / 20%), 0px 12px 17px 2px rgb(0 0 0 / 14%),
				0px 5px 22px 4px rgb(0 0 0 / 12%);
		}

		&.visible {
			--scale: 1;
		}

		&.prev {
			left: 1rem;
		}

		&.next {
			right: 1rem;
		}

		& :global(svg) {
			height: 2rem;
			width: 2rem;
		}

		& :global(svg path) {
			color: var(--app-color-dark-contrast);
		}
	}

	.hider {
		width: 1px;
		height: 100%;
	}
</style>
