<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase
	options={{
		transform: ({ offsetX, offsetY, rootNode }) => {
			rootNode.style.translate = `${offsetX + 50}px ${offsetY + 20}px`;
		},
	}}
>
	Moving by manually setting <code>rootNode.style</code>
</OptionsDemoBase>
