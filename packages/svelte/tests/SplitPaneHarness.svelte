<script lang="ts">
	import { SplitPane } from '@neodrag/svelte/splitpane';

	const split = new SplitPane({ axis: 'x', sizes: [1, 1], minSizes: 0.2 });

	export function sizes(): number[] {
		return split.sizes;
	}
</script>

<div
	data-testid="container"
	{...split.container}
	style="position: absolute; top: 0; left: 0; width: 200px; height: 100px;"
>
	<div data-testid="pane-0" {...split.pane(0)} style="background: #ccd;">A</div>
	<div
		data-testid="gutter-0"
		{...split.gutter(0)}
		style="flex: 0 0 8px; background: #557; cursor: col-resize; touch-action: none;"
	></div>
	<div data-testid="pane-1" {...split.pane(1)} style="background: #dcc;">B</div>
</div>
