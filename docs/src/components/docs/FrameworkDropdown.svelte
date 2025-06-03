<script lang="ts">
	import { FRAMEWORKS, type Framework } from '$helpers/constants';
	import { Select } from 'melt/builders';
	import { prefetch } from 'astro:prefetch';
	import { FRAMEWORK_ICONS } from '$helpers/framework-icons';
	import DownIcon from '~icons/material-symbols/arrow-drop-down';

	type Props = {
		pathname: string;
		selected: Framework;
	};

	const { pathname, selected }: Props = $props();

	const select = new Select<Framework>({
		value: selected,
		onOpenChange() {
			for (const framework of FRAMEWORKS) {
				console.log('gg');
				prefetch(replace_framework_from_pathname(framework.name));
			}
		},
	});

	const REGEX = /\/docs\/(svelte|react|solid|vanilla|vue)/gi;

	function replace_framework_from_pathname(framework: Framework) {
		return pathname.replace(REGEX, `/docs/${framework}`);
	}

	const Icon = FRAMEWORK_ICONS[selected];
</script>

<section>
	<button {...select.trigger}>
		<div class="label">
			<span><Icon /></span>
			<span>
				{select.value}
			</span>
		</div>

		<span>
			<DownIcon />
		</span>
	</button>

	<div class="container" {...select.content}>
		{#each FRAMEWORKS as { name }}
			{@const Icon = FRAMEWORK_ICONS[name]}
			<a href={replace_framework_from_pathname(name)} class="unstyled" {...select.getOption(name)}>
				<Icon />
				{name}
			</a>
		{/each}
	</div>
</section>

<style>
	section {
		--color: color-mix(in lch, var(--app-color-scrolling-navbar), transparent 0%);
		width: 100%;
		padding: 0 0.5rem;
		font-family: var(--app-font-mono);
	}

	a[href] {
		display: flex;
		gap: 0.5rem;

		color: color-mix(in lch, var(--app-color-dark), var(--app-color-anti-mixer) 10%);
		margin: 0;
		font-size: 16px;
		padding: 0.5rem 0.5rem;
		border-radius: inherit;

		:global(svg) {
			width: 1.2rem;
		}

		&:hover {
			text-decoration: none;
			background-color: color-mix(in lch, var(--color), var(--app-color-mixer) 20%);
		}
	}

	button {
		display: flex;
		justify-content: space-between;
		align-content: center;

		background-color: var(--color);
		width: 100%;
		padding: 0.5rem;
		border-radius: 0.375rem;
		cursor: pointer;

		.label {
			display: flex;
			gap: 0.5rem;
		}

		span {
			display: flex;
		}
	}

	.container {
		/* display: flex; */
		flex-direction: column;
		gap: 1rem;
		padding: 0.375rem;

		background: var(--color);
		border: none;
		width: 100%;
		border-radius: 0.375rem;
	}
</style>
