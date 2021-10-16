<script>
  import { draggable } from '../../src';

  export let body = 'Drag me!';
</script>

<div id="drag-target" use:draggable>{body}</div>
