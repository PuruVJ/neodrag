<script lang="ts">
	import { draggable, type DragOptions } from '@neodrag/svelte';

	export let options: DragOptions = {};

	let position = options.position ?? options.defaultPosition ?? { x: 0, y: 0 };

	let key = 0;

	$: {
		key;

		position = options.position ?? options.defaultPosition ?? { x: 0, y: 0 };
	}
</script>

<section class="container">
	{#key key}
		<button class="reset" on:click={() => key++}>Reset</button>

		<div class="parent">
			<slot name="parent-contents" />

			<div
				class="box"
				use:draggable={{
					...options,
					onDrag: (data) => {
						options.onDrag?.(data);
						position = { x: data.offsetX, y: data.offsetY };
					},
				}}
			>
				<slot />
			</div>
		</div>

		<div class="offset">{position.x}, {position.y}</div>
	{/key}
</section>

<style lang="scss">
	.container {
		position: relative;

		display: grid;
		place-items: center;

		height: 30rem;
		width: 100%;

		overflow: hidden;

		background-color: hsla(var(--app-color-dark-hsl), 0.1);
	}

	.reset {
		position: absolute;
		right: 0;
		top: 0;
	}

	.box {
		--size: 8rem;

		position: relative;

		display: grid;
		place-content: center;

		text-align: center;

		width: var(--size);
		height: var(--size);

		background-color: var(--app-color-primary);

		box-shadow: 0px 12.5px 10px rgba(0, 0, 0, 0.035), 0px 100px 80px rgba(0, 0, 0, 0.07);

		border-radius: 0.5rem;

		font-size: large;
		color: var(--app-color-primary-contrast);
	}

	.offset {
		position: absolute;
		bottom: 10px;
		right: 10px;
	}
</style>
