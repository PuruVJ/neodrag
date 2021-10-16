<script>
  import { draggable } from '../../src';

  export let body = 'Drag me!';
</script>

<div id="drag-target" use:draggable={{ bounds: { top: 0, bottom: 100, left: 0, right: 100 } }}>
  {body}
</div>
