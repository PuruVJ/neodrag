<script lang="ts">
	import FeatureContainer from './FeatureContainer.svelte';

	type Props = {
		plugins: string[];
	};

	const { plugins }: Props = $props();
</script>

<FeatureContainer title="Everything's a plugin!">
	{#snippet subheading()}
		<p>Pick, Mix and Match plugins to create your own drag behaviors</p>
	{/snippet}

	<div>
		<ul>
			{#each plugins as plugin}
				<li><button>{plugin}</button></li>
			{/each}
		</ul>
	</div>
</FeatureContainer>

<style>
	ul {
		list-style: none;
		padding: 0;
	}
</style>
