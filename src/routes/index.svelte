<script>
  import DraggableCore from '../../package/DraggableCore.svelte';
</script>

<DraggableCore on:drag={(e) => console.log(e)} />

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
