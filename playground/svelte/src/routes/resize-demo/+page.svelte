<script lang="ts">
	import { Length } from '@neodrag/core';
	import { Resizable } from '@neodrag/svelte/resize';
	import { presetSplitPane, resizeHandles, sizeBounds } from '@neodrag/svelte/resize';

	const length = new Length({ units: 'preserve' });

	const panel = new Resizable({
		length,
		plugins: [...presetSplitPane('x'), sizeBounds({ minWidth: '8rem', maxWidth: '100%' })],
	});

	const box = new Resizable({
		length,
		plugins: [
			resizeHandles({ edges: ['e', 's', 'se'], size: '0.75rem' }),
			sizeBounds({ minWidth: 120, minHeight: 80 }),
		],
	});
</script>

<h1>Resize demo</h1>
<p>
	Left: split-pane preset (east edge). Right: corner resize with CSS-friendly bounds. Both use
	<code>length: new Length(&#123; units: 'preserve' &#125;)</code>.
</p>

<div class="layout">
	<div class="pane host">
		<div class="pane-inner" {...panel.frame}>
			<span>Split pane — drag east edge</span>
		</div>
	</div>
	<div class="box host">
		<div class="box-inner" {...box.frame}>
			<span>Free resize</span>
		</div>
	</div>
</div>

<style>
	.layout {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		margin-top: 1rem;
	}

	.host {
		position: relative;
		background: #1e293b;
		border-radius: 8px;
		overflow: hidden;
	}

	.pane {
		width: min(40%, 280px);
		min-width: 8rem;
		height: 200px;
	}

	.pane-inner {
		width: 50%;
		height: 100%;
		display: grid;
		place-items: center;
		background: linear-gradient(135deg, #38bdf8, #6366f1);
		color: #0f172a;
		font-weight: 600;
		font-size: 0.875rem;
	}

	.box {
		flex: 1;
		min-width: 160px;
		height: 200px;
	}

	.box-inner {
		width: 160px;
		height: 120px;
		display: grid;
		place-items: center;
		background: linear-gradient(135deg, #f472b6, #fb923c);
		color: #1e1b4b;
		font-weight: 600;
		font-size: 0.875rem;
	}

	code {
		font-size: 0.8em;
	}
</style>
