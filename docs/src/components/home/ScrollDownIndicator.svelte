<script lang="ts">
	export let link: string;
</script>

<a href={link} class="scroll-down unstyled" on:click|preventDefault>
	<div class="dot" />
</a>

<style lang="scss">
	.scroll-down {
		display: flex;
		justify-content: center;
		align-items: center;

		position: absolute;
		bottom: 3rem;

		height: 37px;
		width: 21px;

		border-radius: 12px;

		box-shadow: 0 0 0 2px var(--app-color-dark);

		opacity: 0;

		animation-name: fade-in;
		animation-duration: 500ms;
		animation-delay: 1000ms;
		animation-timing-function: ease-in;
		animation-fill-mode: forwards;

		.dot {
			height: 4px;
			width: 4px;

			border-radius: 50%;

			background-color: var(--app-color-dark);

			transform: translateY(-7px);

			animation: dot 2s infinite;
		}
	}

	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes dot {
		0% {
			transform: translateY(-7px);
		}
		80% {
			transform: translateY(7px);
		}
		100% {
			transform: translateY(-7px);
		}
	}
</style>
