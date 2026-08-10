<script lang="ts">
	import { Swipeable } from '@neodrag/svelte/swipe';

	let dir = $state(0);
	// short duration so the test's settle timeout resolves fast
	const swipe = new Swipeable({ axis: 'x', threshold: 0.4, duration: 40, onDismiss: (d) => (dir = d) });

	export const isDismissed = () => swipe.isDismissed;
	export const dismissedDir = () => dir;
	export const offsetX = () => swipe.offset.x;
</script>

<div
	data-testid="card"
	{...swipe.attach}
	style="position: absolute; top: 20px; left: 20px; width: 120px; height: 60px; background: teal; touch-action: none;"
>
	swipe me
</div>
