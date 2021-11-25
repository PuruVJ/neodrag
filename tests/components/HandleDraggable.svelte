<script lang="ts">
	import { draggable } from '../../src';
</script>

<div use:draggable={{ handle: '.handle' }}>
	You shall not drag!!
	<div class="handle">This will drag!</div>
</div>
