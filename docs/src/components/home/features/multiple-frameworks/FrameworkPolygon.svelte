<script lang="ts">
	import { FRAMEWORKS } from '$helpers/constants';
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
	import IonReloadIcon from '~icons/ion/reload';
	import type { Framework } from '$helpers/constants';
	import { draggable, events, position, Compartment, ControlFrom, controls } from '@neodrag/svelte';
	import { expoOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	type Props = {
		children: import('svelte').Snippet;
	};

	const { children }: Props = $props();

	let selected_framework: Framework = $state('svelte');

	let logo_el = $state<HTMLImageElement>();
	let container_el = $state<HTMLElement>();

	// Framework data
	const frameworks = ['solid', 'vanilla', 'react', 'vue', 'svelte']
		.map((name) => FRAMEWORKS.find((f) => f.name === name)!)!
		.map(({ name }) => ({
			name,
			icon: FRAMEWORK_ICONS[name],
		}));

	// State for frameworks and box
	let framework_elements = $state<(HTMLDivElement | null)[]>(
		new Array(frameworks.length).fill(null),
	);
	let box_element = $state<HTMLDivElement | null>(null);
	let framework_positions = $state(
		frameworks.map(() => new Tween({ x: 0, y: 0 }, { easing: expoOut, duration: 1200 })),
	);
	let box_position = $state(new Tween({ x: 0, y: 0 }, { easing: expoOut, duration: 1200 }));
	let z_indices = $state([0, 0, 0, 0, 0]);
	let box_z_index = $state(0);

	// Top-level position compartments
	const position_compartments = frameworks.map((_, idx) =>
		Compartment.of(() => position({ current: framework_positions[idx].current })),
	);
	const box_position_compartment = Compartment.of(() =>
		position({ current: box_position.current }),
	);

	// Line properties for frameworks and box
	let line_properties = $state(
		frameworks.map(() => ({
			thickness: 2,
			left: 0,
			top: 0,
			width: 0,
			angle: 0,
			visible: false,
		})),
	);

	let box_line_properties = $state({
		thickness: 1,
		left: 0,
		top: 0,
		width: 0,
		angle: 0,
		visible: false,
	});

	// Reset functions for frameworks and box
	const reset_fns = {
		...frameworks.reduce(
			(acc, { name }, idx) => {
				acc[name] = () => (framework_positions[idx].target = { x: 0, y: 0 });
				return acc;
			},
			{} as Record<Framework, () => void>,
		),
		box: () => (box_position.target = { x: 0, y: 0 }),
	};

	function update_z_index(index: number) {
		const all_z_indices = [...z_indices, box_z_index];
		z_indices[index] = Math.max(...all_z_indices) + 1;

		const lowest_z_index = all_z_indices.reduce((acc, curr) => {
			if (curr === 0) return acc;
			return Math.min(acc, curr);
		}, Infinity);

		if (z_indices[index] > z_indices.length + 1) {
			z_indices = z_indices.map((z) => (z >= lowest_z_index ? z - lowest_z_index : z));
			if (box_z_index >= lowest_z_index) {
				box_z_index = box_z_index - lowest_z_index;
			}
		}
	}

	function update_box_z_index() {
		const all_z_indices = [...z_indices, box_z_index];
		box_z_index = Math.max(...all_z_indices) + 1;

		const lowest_z_index = all_z_indices.reduce((acc, curr) => {
			if (curr === 0) return acc;
			return Math.min(acc, curr);
		}, Infinity);

		if (box_z_index > z_indices.length + 1) {
			z_indices = z_indices.map((z) => (z >= lowest_z_index ? z - lowest_z_index : z));
			box_z_index = box_z_index >= lowest_z_index ? box_z_index - lowest_z_index : box_z_index;
		}
	}

	function calculate_line_properties(index: number) {
		if (!framework_elements[index] || !logo_el || !container_el) return;

		const container_rect = container_el.getBoundingClientRect();
		const logo_rect = logo_el.getBoundingClientRect();
		const framework_rect = framework_elements[index]!.getBoundingClientRect();

		const x1 = logo_rect.left - container_rect.left + logo_rect.width / 2;
		const y1 = logo_rect.top - container_rect.top + logo_rect.height / 2;
		const x2 = framework_rect.left - container_rect.left + framework_rect.width / 2;
		const y2 = framework_rect.top - container_rect.top + framework_rect.height / 2;

		const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		const cx = (x1 + x2) / 2 - length / 2;
		const cy = (y1 + y2) / 2 - 1;
		const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

		line_properties[index] = {
			thickness: 2,
			left: cx,
			top: cy,
			width: length,
			angle,
			visible: true,
		};
	}

	function calculate_box_line_properties() {
		if (!box_element || !logo_el || !container_el) return;

		const container_rect = container_el.getBoundingClientRect();
		const logo_rect = logo_el.getBoundingClientRect();
		const box_rect = box_element.getBoundingClientRect();

		const x1 = logo_rect.left - container_rect.left + logo_rect.width / 2;
		const y1 = logo_rect.top - container_rect.top + logo_rect.height / 2;
		const x2 = box_rect.left - container_rect.left + box_rect.width / 2;
		const y2 = box_rect.top - container_rect.top + box_rect.height / 2;

		const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
		const cx = (x1 + x2) / 2 - length / 2;
		const cy = (y1 + y2) / 2 - 1;
		const angle = Math.atan2(y1 - y2, x1 - x2) * (180 / Math.PI);

		box_line_properties = {
			thickness: 2,
			left: cx,
			top: cy,
			width: length,
			angle,
			visible: true,
		};
	}

	function update_all_lines() {
		frameworks.forEach((_, index) => {
			calculate_line_properties(index);
		});
		calculate_box_line_properties();
	}

	// Update compartments when positions change
	$effect(() => {
		framework_positions.forEach((pos, idx) => {
			pos.current;
			position_compartments[idx].current = position({ current: pos.current });
		});

		box_position.current;
		box_position_compartment.current = position({ current: box_position.current });
	});

	// RAF loop for continuous line updates
	let raf_id: number;
	function raf_loop() {
		update_all_lines();
		raf_id = requestAnimationFrame(raf_loop);
	}

	// Start RAF when all elements are ready
	$effect(() => {
		if (logo_el && container_el && framework_elements.every((el) => el !== null) && box_element) {
			raf_loop();
			return () => cancelAnimationFrame(raf_id);
		}
	});

	function selectFramework(framework: Framework) {
		// Check if View Transitions API is supported
		if (typeof document !== 'undefined' && 'startViewTransition' in document) {
			// Use View Transitions API
			(document as any).startViewTransition(() => {
				selected_framework = framework;
			});
		} else {
			// Fallback for browsers without View Transitions support
			selected_framework = framework;
		}
	}
</script>

<section class={['container', selected_framework]} bind:this={container_el}>
	<button class="reset" onclick={() => Object.values(reset_fns).forEach((fn) => fn())}>
		<IonReloadIcon />
	</button>

	<!-- Framework logos in arc -->
	<section class="frameworks-section">
		<div class="frameworks-arc">
			{#each frameworks as { name, icon: Icon }, idx}
				<div
					class="framework-item"
					style:z-index={z_indices[idx]}
					bind:this={framework_elements[idx]}
					data-paw-cursor="true"
					{@attach draggable(() => [
						position_compartments[idx],
						events({
							onDragStart: () => update_z_index(idx),
							onDrag: (data) => framework_positions[idx].set(data.offset, { duration: 0 }),
						}),
					])}
				>
					<button onclick={() => selectFramework(name)}>
						<span>
							<Icon />
						</span>
					</button>
				</div>
			{/each}
		</div>
	</section>

	<!-- Center: Neodrag logo -->
	<section class="logo-section">
		<img bind:this={logo_el} src="/logo.svg" draggable="false" class="logo" alt="Neodrag logo" />
	</section>

	<!-- Right: Draggable box with view transition name -->
	<section class="empty-section">
		<div
			class="empty-box"
			style:z-index={box_z_index}
			bind:this={box_element}
			{@attach draggable(() => [
				box_position_compartment,
				controls({ allow: ControlFrom.selector('.handle') }),
				events({
					onDragStart: () => update_box_z_index(),
					onDrag: (data) => box_position.set(data.offset, { duration: 0 }),
				}),
			])}
		>
			<div class="handle" data-paw-cursor="true"></div>

			<div class="code" style="view-transition-name: code-content">
				{@render children?.()}
			</div>
		</div>
	</section>

	<!-- Lines connecting frameworks to logo -->
	{#each line_properties as line, idx}
		{#if line.visible}
			<div
				class="line"
				data-framework={frameworks[idx].name}
				style:--top="{line.top}px"
				style:--left="{line.left}px"
				style:--length="{line.width}px"
				style:--thickness="{line.thickness}px"
				style:--angle="{line.angle}deg"
				in:fade={{ delay: 1000 }}
			></div>
		{/if}
	{/each}

	<!-- Line connecting box to logo -->
	{#if box_line_properties.visible}
		<div
			class="line box-line"
			data-framework="box"
			style:--top="{box_line_properties.top}px"
			style:--left="{box_line_properties.left}px"
			style:--length="{box_line_properties.width}px"
			style:--thickness="{box_line_properties.thickness}px"
			style:--angle="{box_line_properties.angle}deg"
			in:fade={{ delay: 1000 }}
		></div>
	{/if}
</section>

<style>
	.container {
		/* Move arc and logo backward by 10rem when viewport hits 1267px */
		--structure-offset: clamp(-10rem, calc(100vw - 1267px), 0rem);
		/* Keep right margin separate - not affected by structure offset */
		--right-margin: clamp(2%, calc((100vw - 800px) / 20), 10%);

		/* Arc positioning with offset */
		--arc-radius: 14rem;
		--arc-radius-mobile: 12rem;
		--arc-radius-tiny: 5rem;
		--arc-center-x: calc(var(--structure-offset) - 20rem);
		--arc-center-x-mobile: calc(var(--structure-offset) - 16rem);

		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 40rem;
		padding: 2rem;

		@media (min-width: 969px) {
			padding: 2rem 6rem;
		}

		@media (max-width: 1037px) {
			min-height: 100vh;
			padding: 2rem 1rem;
		}

		@media (max-width: 768px) {
			min-height: 100vh;
			padding: 1.5rem 1rem;
		}

		section {
			z-index: 3;
		}

		&.svelte :global(.svelte pre) {
			display: block;
		}

		&.react :global(.react pre) {
			display: block;
		}

		&.vanilla :global(.vanilla pre) {
			display: block;
		}

		&.solid :global(.solid pre) {
			display: block;
		}

		&.vue :global(.vue pre) {
			display: block;
		}

		:global {
			pre {
				all: unset;
				display: none;
			}

			p,
			pre.astro-code,
			blockquote {
				--shiki-dark-bg: transparent !important;
				max-width: clamp(20ch, 100vw, var(--entity-width));

				@media (max-width: 967px) {
					max-width: 100%;
				}
			}

			.astro-code .line {
				display: inline-block;
				width: 100%;
			}

			.astro-code span {
				background-color: transparent !important;
			}

			.astro-code .line.highlighted {
				background-color: color-mix(in lch, var(--app-color-dark), transparent 40%) !important;
			}
		}
	}

	.frameworks-section {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(var(--arc-center-x), -50%);

		@media (max-width: 1037px) {
			top: 19%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		@media (max-width: 768px) {
			top: 14%;
		}
	}

	.frameworks-arc {
		position: relative;
		width: 30rem;
		height: 30rem;

		@media (max-width: 1037px) {
			width: 32rem;
			height: 32rem;
		}

		@media (max-width: 768px) {
			width: 30rem;
			height: 30rem;
		}

		@media (max-width: 500px) {
			width: 16rem;
			height: 16rem;
		}
	}

	.framework-item {
		position: absolute;
		display: block;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 3rem;
		height: 3rem;
		top: 50%;
		left: 50%;
		margin: calc(-1 * (3rem / 2));

		@media (max-width: 768px) {
			width: 2rem;
			height: 2rem;
			margin: -1rem;
		}

		@media (max-width: 500px) {
			width: 1.8rem;
			height: 1.8rem;
			margin: -0.9rem;
		}
	}

	.framework-item:nth-of-type(1) {
		transform: rotate(110deg) translate(var(--arc-radius)) rotate(-110deg);
	}

	.framework-item:nth-of-type(2) {
		transform: rotate(145deg) translate(var(--arc-radius)) rotate(-145deg);
	}

	.framework-item:nth-of-type(3) {
		transform: rotate(180deg) translate(var(--arc-radius)) rotate(-180deg);
	}

	.framework-item:nth-of-type(4) {
		transform: rotate(215deg) translate(var(--arc-radius)) rotate(-215deg);
	}

	.framework-item:nth-of-type(5) {
		transform: rotate(250deg) translate(var(--arc-radius)) rotate(-250deg);
	}

	@media (max-width: 1037px) {
		.framework-item:nth-of-type(1) {
			transform: rotate(170deg) translate(var(--arc-radius-mobile)) rotate(-170deg);
		}

		.framework-item:nth-of-type(2) {
			transform: rotate(220deg) translate(var(--arc-radius-mobile)) rotate(-220deg);
		}

		.framework-item:nth-of-type(3) {
			transform: rotate(270deg) translate(var(--arc-radius-mobile)) rotate(-270deg);
		}

		.framework-item:nth-of-type(4) {
			transform: rotate(320deg) translate(var(--arc-radius-mobile)) rotate(-320deg);
		}

		.framework-item:nth-of-type(5) {
			transform: rotate(10deg) translate(var(--arc-radius-mobile)) rotate(-10deg);
		}
	}

	@media (max-width: 768px) {
		.framework-item:nth-of-type(1) {
			transform: rotate(170deg) translate(var(--arc-radius-mobile)) rotate(-170deg);
		}

		.framework-item:nth-of-type(2) {
			transform: rotate(220deg) translate(var(--arc-radius-mobile)) rotate(-220deg);
		}

		.framework-item:nth-of-type(3) {
			transform: rotate(270deg) translate(var(--arc-radius-mobile)) rotate(-270deg);
		}

		.framework-item:nth-of-type(4) {
			transform: rotate(320deg) translate(var(--arc-radius-mobile)) rotate(-320deg);
		}

		.framework-item:nth-of-type(5) {
			transform: rotate(10deg) translate(var(--arc-radius-mobile)) rotate(-10deg);
		}
	}

	@media (max-width: 500px) {
		.framework-item:nth-of-type(1) {
			transform: rotate(170deg) translate(var(--arc-radius-tiny)) rotate(-170deg);
		}

		.framework-item:nth-of-type(2) {
			transform: rotate(220deg) translate(var(--arc-radius-tiny)) rotate(-220deg);
		}

		.framework-item:nth-of-type(3) {
			transform: rotate(270deg) translate(var(--arc-radius-tiny)) rotate(-270deg);
		}

		.framework-item:nth-of-type(4) {
			transform: rotate(320deg) translate(var(--arc-radius-tiny)) rotate(-320deg);
		}

		.framework-item:nth-of-type(5) {
			transform: rotate(10deg) translate(var(--arc-radius-tiny)) rotate(-10deg);
		}
	}

	.framework-item button {
		background-color: transparent;
		height: max-content;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;

		:global(svg) {
			min-width: clamp(2rem, 5vw, 2.5rem);
			transition: transform 0.2s ease;

			&:hover {
				transform: scale(1.2);
			}
		}

		@media (max-width: 500px) {
			:global(svg) {
				min-width: clamp(1.2rem, 4vw, 1.6rem);
			}
		}
	}

	.logo-section {
		position: absolute;
		top: 50%;
		left: calc(50% + var(--structure-offset));
		transform: translate(-50%, -50%);
		z-index: 2;

		@media (max-width: 1037px) {
			top: 26%;
			left: 50%;
			transform: translate(-50%, -50%);
		}

		@media (max-width: 768px) {
			top: 21%;
		}
	}

	.logo {
		width: clamp(4rem, 20vw, 7rem);
		z-index: 7;

		@media (max-width: 1037px) {
			width: clamp(3rem, 15vw, 4.5rem);
		}

		@media (max-width: 768px) {
			width: clamp(2rem, 15vw, 5rem);
		}

		@media (max-width: 500px) {
			width: clamp(1.5rem, 8vw, 2.5rem);
		}
	}

	.empty-section {
		position: absolute;
		top: 50%;
		right: var(--right-margin);
		transform: translateY(-50%);

		@media (max-width: 1037px) {
			top: 41%;
			left: 50%;
			right: unset;
			transform: translate(-50%, -50%);
		}

		@media (max-width: 768px) {
			top: 36%;
		}
	}

	.empty-box {
		position: relative;
		width: 30rem;
		border: 1px solid color-mix(in lch, var(--app-color-dark), transparent 75%);
		border-radius: 12px;
		background-color: color-mix(in lch, var(--app-color-dark), var(--app-color-mixer) 100%);
		touch-action: none;
		user-select: none;
		z-index: 5;

		@media (max-width: 1037px) {
			width: min(85vw, 30rem);
		}

		@media (max-width: 768px) {
			width: min(90vw, 28rem);
		}

		@media (max-width: 500px) {
			width: min(98vw, 22rem);
			transform: scale(0.9);
		}
	}

	.empty-box .handle {
		width: 100%;
		height: 2rem;
		border-bottom: 1px solid color-mix(in lch, var(--app-color-dark), transparent 75%);
		flex-shrink: 0;
	}

	.empty-box .code {
		padding: 1rem;
	}

	.line {
		position: absolute;
		top: var(--top);
		left: var(--left);
		padding: 0px;
		margin: 0px;
		background-color: color-mix(in lch, var(--app-color-dark), transparent 50%);
		line-height: 1px;
		height: var(--thickness);
		width: var(--length);
		transform: rotate(var(--angle));
		will-change: width;
		pointer-events: none;
		z-index: 1;
	}

	.box-line {
		background-color: color-mix(in lch, var(--app-color-dark), transparent 30%);
	}

	.reset {
		position: absolute;
		right: 8px;
		top: 8px;
		z-index: 20;
		font-size: 1.2rem;
		padding: 0.5rem;
		border-radius: 8px;
		background-color: color-mix(in lch, var(--app-color-dark), transparent 70%);
		backdrop-filter: blur(5px);

		&:hover :global(svg) {
			transform: rotate(100deg) scale(1.2);
		}

		:global(svg) {
			transition: transform 0.2s ease-in-out;
			color: var(--app-color-dark);
		}
	}

	/* View Transitions CSS */
	:global(::view-transition-old(code-content)),
	:global(::view-transition-new(code-content)) {
		animation-duration: 0.4s;
		animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	:global(::view-transition-old(code-content)) {
		animation-name: slide-out-fade;
	}

	:global(::view-transition-new(code-content)) {
		animation-name: slide-in-fade;
	}

	@keyframes slide-out-fade {
		to {
			opacity: 0;
		}
	}

	@keyframes slide-in-fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
