<script lang="ts">
	import { SplitPane } from '@neodrag/svelte/splitpane';

	// Outer horizontal split; the right pane is itself a vertical split. Two fully independent
	// instances — own controller, own gutter Draggable, no shared state.
	const outer = new SplitPane({ axis: 'x', sizes: [1, 1] });
	const inner = new SplitPane({ axis: 'y', sizes: [1, 1] });

	export const outerSizes = () => outer.sizes;
	export const innerSizes = () => inner.sizes;
</script>

<div
	data-testid="outer"
	{...outer.container}
	style="position: absolute; top: 0; left: 0; width: 240px; height: 160px;"
>
	<div data-testid="o-pane-0" {...outer.pane(0)} style="background: #ccd;">L</div>
	<div data-testid="o-gutter" {...outer.gutter(0)} style="flex: 0 0 8px; background: #557; touch-action: none;"></div>
	<div data-testid="o-pane-1" {...outer.pane(1)} style="background: #dcd;">
		<!-- nested split fills the pane -->
		<div data-testid="inner" {...inner.container} style="width: 100%; height: 100%;">
			<div data-testid="i-pane-0" {...inner.pane(0)} style="background: #cdc;">T</div>
			<div data-testid="i-gutter" {...inner.gutter(0)} style="flex: 0 0 8px; background: #575; touch-action: none;"></div>
			<div data-testid="i-pane-1" {...inner.pane(1)} style="background: #dcc;">B</div>
		</div>
	</div>
</div>
