<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase
	options={{
		transform: ({ offsetX, offsetY }) => {
			return `translate(${offsetX + 50}px, ${offsetY + 20}px)`;
		},
	}}
>
	Moving by returning <code>transform</code> string
</OptionsDemoBase>
