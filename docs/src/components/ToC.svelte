<script lang="ts">
	import { browser, elements_overlap, wait_for } from '$helpers/utils';
	import { onDestroy, onMount } from 'svelte';
	import { expoIn } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { throttle } from 'throttle-debounce';

	let headings: {
		id: string;
		text: string;
		level: number;
		el: HTMLHeadingElement;
		length: number;
	}[] = $state([]);

	let nav_el = $state<HTMLElement>();

	let options_examples_containers: NodeListOf<HTMLElement>;
	let heading_els: NodeListOf<HTMLHeadingElement>;
	let scrollable_main_el: HTMLElement;

	let is_nav_overlapping = $state(false);
	let heading_ids_highlighted: string[] = [];

	let anchor_els: Record<string, HTMLAnchorElement> = $state({});

	function getHeadings() {
		return Array.from(heading_els)
			.map((heading) => {
				const id = heading.id;

				// Regex to replace \n and \t characters
				const text =
					heading.textContent?.replaceAll(/\t/gi, '')?.replaceAll(/\n/gi, '') ??
					'';

				const level = +heading.tagName[1];

				return {
					id,
					text,
					level,
					el: heading as HTMLHeadingElement,
					length: text.length,
				};
			})
			.filter((heading) => heading.id !== '');
	}

	function handle_scroll() {
		for (const el of options_examples_containers) {
			const is_intersecting = elements_overlap(el, nav_el!);

			if (is_intersecting) {
				is_nav_overlapping = true;
				return;
			}
		}

		is_nav_overlapping = false;
	}

	const throttled_handle_scroll = throttle(100, handle_scroll);

	onMount(async () => {
		await wait_for(500);

		heading_els =
			document.querySelectorAll<HTMLHeadingElement>('h2, h3, h4, h5, h5');
		options_examples_containers = document.querySelectorAll<HTMLElement>(
			'#options-examples-container',
		);

		scrollable_main_el = document.querySelector('main')!;
		scrollable_main_el?.addEventListener('scroll', throttled_handle_scroll);

		headings = getHeadings();

		// Now set up the intersection observers on headings. In case they are in viewport

		// const observer = new IntersectionObserver(
		// 	(entries) => {
		// 		// TODO: Add proper highlight later
		// 		// for (const entry of entries) {
		// 		// 	if (entry.isIntersecting) {
		// 		// 		headingIDsHighlighted.push(entry.target.id);
		// 		// 	} else {
		// 		// 		if (headingIDsHighlighted.length > 1)
		// 		// 			headingIDsHighlighted = headingIDsHighlighted.filter(
		// 		// 				(id) => id !== entry.target.id
		// 		// 			);
		// 		// 	}
		// 		// }
		// 		// headingIDsHighlighted = headingIDsHighlighted;
		// 		// console.log(headingIDsHighlighted);
		// 	},
		// 	{
		// 		root: scrollableMainEl,
		// 		rootMargin: '-25% 0',
		// 		threshold: [1],
		// 	}
		// );

		// for (const heading of Array.from(headingEls)) {
		// 	observer.observe(heading);
		// }
	});

	onDestroy(() => {
		scrollable_main_el?.removeEventListener('scroll', throttled_handle_scroll);
	});
</script>

<aside
	class:hidden={is_nav_overlapping}
	aria-label="Links to sections in this Page"
>
	<nav bind:this={nav_el}>
		{#if headings}
			<ul in:fade={{ easing: expoIn, duration: 300 }}>
				{#each headings as { id, level, text, length }}
					<li
						data-id={id}
						class:highlighted={heading_ids_highlighted.includes(id)}
						style:--level={level - 2}
					>
						<a href="#{id}" class="unstyled" bind:this={anchor_els[id]}
							>{text}</a
						>
						<div
							class="placeholder"
							style:--width={browser
								? anchor_els[id]?.getBoundingClientRect().width + 'px'
								: length * 0.4 + 'em'}
						></div>
					</li>
				{/each}
			</ul>
		{/if}
	</nav>
</aside>

<style lang="scss">
	@import '../css/breakpoints';

	// .reveal-toc {
	// 	position: fixed;
	// 	top: 0;
	// 	right: 0;
	// 	z-index: 11;
	// 	display: grid;
	// 	align-items: center;
	// 	&.hidden {
	// 		pointer-events: none;
	// 		opacity: 0;
	// 	}
	// }
	aside {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 10;

		display: grid;
		align-items: center;

		width: 17vw;
		height: 100%;

		transition: opacity 150ms ease-in;

		@include media('<desktop') {
			display: none;
		}

		&.hidden {
			pointer-events: none;
			opacity: 0;
		}

		&:hover {
			li a {
				opacity: 1;
			}

			li .placeholder {
				opacity: 0;
			}
		}
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		position: relative;

		padding: 0;
		padding-left: calc(var(--level) * 0.75em);

		height: 1.4em;

		a,
		.placeholder {
			transition: 100ms ease-in;
			transition-property: opacity, color, background-color;
		}

		&.highlighted {
			.placeholder {
				background-color: var(--secondary-color);
			}

			a {
				color: var(--secondary-color);
			}
		}
	}

	a,
	a:visited {
		font-size: 0.8em;
		line-height: 1;
		color: hsla(var(--app-color-dark-hsl), 0.7);

		opacity: 0;

		padding: 0;

		margin: 0;
	}

	.placeholder {
		position: absolute;
		top: 50%;

		height: 4px;
		width: var(--width);

		background-color: hsla(var(--app-color-dark-hsl), 0.7);

		border-radius: 0 2px 2px 0;

		pointer-events: none;
	}
</style>
