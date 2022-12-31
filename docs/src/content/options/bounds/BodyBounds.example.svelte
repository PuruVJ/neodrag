<script lang="ts">
	import OptionsDemoBase from '$components/options/OptionsDemoBase.svelte';
</script>

<OptionsDemoBase
	customClass="bound-body"
	options={{ bounds: '.options-demo-base-container.bound-body' }}
>
	Can't go outside <code>&lt;body&gt;</code>
</OptionsDemoBase>
