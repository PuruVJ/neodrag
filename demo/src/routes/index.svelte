<script>
  import { draggable } from '../../../dist/index';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<div use:draggable class="box">
  hello

  <div class="handle">Le handel</div>
</div>

<style>
  .box {
    width: 100px;
    height: 100px;

    background-color: aquamarine;
  }
</style>
