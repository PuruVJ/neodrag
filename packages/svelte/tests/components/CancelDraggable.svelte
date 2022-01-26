<script lang="ts">
	import { draggable } from '../../src';
</script>

<div use:draggable={{ cancel: '.cancel' }}>
	This will drag!
	<div class="cancel">You shall not drag!!</div>
</div>
