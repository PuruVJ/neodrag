<script lang="ts">
	import Box from '$lib/Box.svelte';
	import { axis, Compartment, position } from '../../../../../src/plugins';

	const { data } = $props();

	let compartment: Compartment;

	if (data.types === 'undefined-to-plugin') {
		compartment = new Compartment();
	} else {
		compartment = new Compartment(() => axis('x'));
	}

	function switcheroo() {
		if (data.types === 'plugin-func-to-plugin' || data.types === 'undefined-to-plugin') {
			compartment.current = position({ current: { x: 450, y: 300 } });
		} else {
			compartment.current = undefined;
		}
	}
</script>

<Box testid="draggable" plugins={() => [compartment]}></Box>

<button onclick={switcheroo} data-testid="switcheroo">Switch</button>
