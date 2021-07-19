<script>
  import { draggable } from '../../../dist/index';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div use:draggable={{ cancel: '.cancel' }} class="box">
  hello

  <div class="handle">Le handel</div>
  <div class="cancel">Cancel</div>
</div>

<style>
  :global(body) {
    background-color: rgb(26, 32, 39);
    color: white;

    font-family: monospace;
  }

  .box {
    width: 100px;
    height: 100px;

    background-color: aquamarine;
    color: black;
  }
</style>
