<script lang="ts">
	import { draggable } from '@neodrag/svelte';
</script>

<div class="option-demo-box" use:draggable={{ axis: 'both' }}>Both axes</div>
