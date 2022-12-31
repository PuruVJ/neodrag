<script lang="ts">
	import { browser, elementsOverlap } from '$helpers/utils';
	import { onDestroy, onMount } from 'svelte';
	import { throttle } from 'throttle-debounce';

	let headings: {
		id: string;
		text: string;
		level: number;
		el: HTMLHeadingElement;
		length: number;
	}[] = [];

	let navEl: HTMLElement;

	let optionsExamplesContainers: NodeListOf<HTMLElement>;
	let headingEls: NodeListOf<HTMLHeadingElement>;
	let scrollableMainEl: HTMLElement;

	let isNavOverlapping = false;
	let headingIDsHighlighted: string[] = [];

	let anchorEls: Record<string, HTMLAnchorElement> = {};

	function getHeadings() {
		return Array.from(headingEls)
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

	function handleScroll() {
		for (const el of optionsExamplesContainers) {
			const isIntersecting = elementsOverlap(el, navEl);

			if (isIntersecting) {
				isNavOverlapping = true;
				return;
			}
		}

		isNavOverlapping = false;
	}

	const throttledHandleScroll = throttle(100, handleScroll);

	onMount(() => {
		headingEls =
			document.querySelectorAll<HTMLHeadingElement>('h2, h3, h4, h5, h5');
		optionsExamplesContainers = document.querySelectorAll<HTMLElement>(
			'#options-examples-container'
		);

		scrollableMainEl = document.querySelector('main')!;
		scrollableMainEl?.addEventListener('scroll', throttledHandleScroll);

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
		scrollableMainEl?.removeEventListener('scroll', throttledHandleScroll);
	});
</script>

<aside
	class:hidden={isNavOverlapping}
	aria-label="Links to sections in this Page"
>
	<nav bind:this={navEl}>
		<ul>
			{#each headings as { id, level, text, length }}
				<li
					data-id={id}
					class:highlighted={headingIDsHighlighted.includes(id)}
					style:--level={level - 2}
				>
					<a href="#{id}" class="unstyled" bind:this={anchorEls[id]}>{text}</a>
					<div
						class="placeholder"
						style:--width={browser
							? anchorEls[id]?.getBoundingClientRect().width + 'px'
							: length * 0.4 + 'em'}
					/>
				</li>
			{/each}
		</ul>
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
				background-color: var(--selection-color);
			}

			a {
				color: var(--selection-color);
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
