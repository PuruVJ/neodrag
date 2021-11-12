<script lang="ts">
  import { draggable } from '../../../dist';
  import { spring, tweened } from 'svelte/motion';
  import type { DragOptions } from '../../../dist';
  import { bounceIn, sineIn, sineOut } from 'svelte/easing';

  // import { draggable } from 'svelte-drag';
  // import type { Options } from 'svelte-drag';

  let boundToBody = false;

  let options: DragOptions;
  $: options = {
    applyUserSelectHack: true,
    axis: 'both',
    cancel: '.cancel',
    handle: '.handle',
    defaultClass: 'svelte-drag',
    defaultClassDragged: 'svelte-dragged',
    defaultClassDragging: 'svelte-dragging',
    defaultPosition: { x: 0, y: 0 },
    disabled: false,
    gpuAcceleration: true,
    // grid: [100, 100],
    // bounds: boundToBody ? 'body' : undefined,
    // bounds: { top: 100, left: 100, right: 100, bottom: 40 },
    // bounds: 'parent',
  } as DragOptions;

  // $: console.log(options);

  let progressY = tweened(0, { easing: sineIn });
  let progressX = tweened(0, { easing: sineIn });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<label>
  Apply user select hack
  <input type="checkbox" bind:checked={options.applyUserSelectHack} />
</label>

<br /> <br />

<label>
  Bound to body
  <input type="checkbox" bind:checked={boundToBody} />
</label>

<br /> <br />

<div>
  Axis:

  <label>
    <input type="radio" bind:group={options.axis} value="both" />
    Both
  </label>

  <label>
    <input type="radio" bind:group={options.axis} value="x" />
    x
  </label>

  <label>
    <input type="radio" bind:group={options.axis} value="y" />
    y
  </label>

  <label>
    <input type="radio" bind:group={options.axis} value="none" />
    none
  </label>
</div>

<br />

<div>
  Cancel:

  <label>
    <input type="radio" bind:group={options.cancel} value=".cancel" />
    .cancel
  </label>

  <label>
    <input type="radio" bind:group={options.cancel} value=".cancel-2" />
    .cancel-2
  </label>

  <label>
    <input type="radio" bind:group={options.cancel} value={undefined} />
    undefined
  </label>
</div>

<br />

<div>
  handle:

  <label>
    <input type="radio" bind:group={options.handle} value=".handle" />
    .handle
  </label>

  <label>
    <input type="radio" bind:group={options.handle} value=".handle-2" />
    .handle-2
  </label>

  <label>
    <input type="radio" bind:group={options.handle} value={undefined} />
    undefined
  </label>
</div>

<br />

<div>
  Default class: <input bind:value={options.defaultClass} />
</div>

<br />

<div>
  <label>
    Disabled
    <input type="checkbox" bind:checked={options.disabled} />
  </label>
</div>

<br />

<div use:draggable={options} class="box">
  hello

  <div class="handle">Le handel</div>
  <div class="cancel">Cancel</div>

  <div class="handle-2">Le handel 2</div>
  <div class="cancel-2">Cancel 2</div>
</div>

<div
  use:draggable={options}
  on:svelte-drag={(e) => {
    progressX = e.detail.offsetX;
    progressY = e.detail.offsetY;
  }}
  class="box"
>
  2nd one

  <div class="handle">Le handel</div>
  <div class="cancel">Cancel</div>

  <div class="handle-2">Le handel 2</div>
  <div class="cancel-2">Cancel 2</div>
</div>

<br /><br /><br /><br /><br /><br />

<input type="number" bind:value={$progressX} />
<input type="number" bind:value={$progressY} />

<div
  use:draggable={{ controlledPosition: { y: $progressY, x: $progressX } }}
  on:svelte-drag={(e) => {
    progressX.set(e.detail.offsetX, { duration: 0 });
    progressY.set(e.detail.offsetY, { duration: 0 });
  }}
  on:svelte-drag:end={() => {
    $progressX = 0;
    $progressY = 0;
  }}
  class="box"
/>

<style>
  :global(body) {
    background-color: rgb(26, 32, 39);
    color: white;

    font-family: monospace;
    margin: 30px;
  }

  .box {
    width: 200px;
    height: 200px;

    background-color: aquamarine;
    color: black;
  }
</style>
