<script lang="ts">
	import { Length, Neodrag } from '@neodrag/core';
	import { Draggable } from '@neodrag/svelte';
	import { ControlFrom, controls } from '@neodrag/svelte/plugins';
	import { Resizable, resizeHandles } from '@neodrag/svelte/resize';

	type DeskWindow = {
		id: string;
		title: string;
		left: string;
		top: string;
		width: string;
		height: string;
		z: number;
		variant: 'finder' | 'notes';
	};

	let windows = $state<DeskWindow[]>([
		{
			id: 'finder',
			title: 'Finder — Documents',
			left: 'clamp(1rem, 8vw, 4rem)',
			top: 'clamp(1.5rem, 10vh, 3rem)',
			width: 'min(480px, 75vw)',
			height: 'min(320px, 55vh)',
			z: 2,
			variant: 'finder',
		},
		{
			id: 'notes',
			title: 'Neodrag — readme',
			left: 'clamp(8rem, 38vw, 22rem)',
			top: 'clamp(6rem, 28vh, 10rem)',
			width: 'min(340px, 70vw)',
			height: 'min(240px, 45vh)',
			z: 1,
			variant: 'notes',
		},
	]);

	const engine = new Neodrag({ dev: false });
	const length = new Length({ units: 'preserve' });

	function create_window_bindings() {
		const drag = new Draggable({
			engine,
			plugins: [controls({ allow: ControlFrom.selector('[data-window-drag]') })],
			threshold: null,
		});
		const resize = new Resizable({
			engine,
			length,
			minSize: { width: 200, height: 120 },
			maxSize: { width: '94%', height: '88%' },
			plugins: [resizeHandles({ edges: 'all', size: 10, cornerSize: 20 })],
		});
		return { drag, resize };
	}

	const finder = create_window_bindings();
	const notes = create_window_bindings();

	function bindings_for(id: string) {
		return id === 'finder' ? finder : notes;
	}

	function focus_window(id: string) {
		const max_z = Math.max(...windows.map((w) => w.z));
		windows = windows.map((w) => (w.id === id ? { ...w, z: max_z + 1 } : w));
	}
</script>

<div class="desk">
	<header class="desk-chrome">
		<h1 class="brand">Neodrag</h1>
		<p class="tagline">Drag the title bar · resize from the edges</p>
	</header>

	<div class="desk-surface">
		{#each windows as win (win.id)}
			{@const { drag, resize } = bindings_for(win.id)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="window-shell"
				style:left={win.left}
				style:top={win.top}
				style:width={win.width}
				style:height={win.height}
				style:z-index={win.z}
				{@attach drag.attachment}
				{@attach resize.attachment}
				onpointerdown={() => focus_window(win.id)}
			>
				<div class="window">
					<header class="titlebar">
						<div class="titlebar-body" data-window-drag>
							<div class="traffic" aria-hidden="true">
								<span class="dot close"></span>
								<span class="dot min"></span>
								<span class="dot max"></span>
							</div>
							<span class="title">{win.title}</span>
						</div>
					</header>

					{#if win.variant === 'finder'}
						<div class="toolbar">
							<span class="tb-btn">‹</span>
							<span class="tb-btn">›</span>
							<span class="tb-path">Macintosh HD · Documents</span>
						</div>
						<div class="content finder-content">
							<div class="sidebar">
								<p class="side-label">Favorites</p>
								<ul>
									<li class="active">Documents</li>
									<li>Downloads</li>
									<li>Desktop</li>
								</ul>
							</div>
							<div class="files">
								<div class="file">📁 Playground</div>
								<div class="file">📄 readme.md</div>
							</div>
						</div>
					{:else}
						<div class="content notes-content">
							<p>One engine for drag, drop, sort, and resize.</p>
							<p class="dim">Pick a world on the left — more scenes ship one by one.</p>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.desk {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'SF Pro Text',
			system-ui,
			sans-serif;
	}

	.desk-chrome {
		flex-shrink: 0;
		padding: 0.75rem 1rem 0.5rem;
		color: rgb(255 255 255 / 0.9);
	}

	.brand {
		margin: 0;
		font-family: var(--app-font-heading);
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.tagline {
		margin: 0.15rem 0 0;
		font-size: 0.8rem;
		opacity: 0.7;
	}

	.desk-surface {
		position: relative;
		flex: 1;
		min-height: 0;
		margin: 0 0.75rem 0.75rem;
		border-radius: 0.75rem;
		overflow: hidden;
		background:
			radial-gradient(ellipse 120% 80% at 20% 0%, #5b8fd9 0%, transparent 55%),
			radial-gradient(ellipse 90% 70% at 90% 10%, #c084fc 0%, transparent 50%),
			linear-gradient(165deg, #1a3a5c 0%, #2d1b4e 40%, #0f172a 100%);
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.08);
	}

	.window-shell {
		position: absolute;
		touch-action: none;
	}

	.window-shell :global([data-neodrag-resize-handle]) {
		pointer-events: auto;
		z-index: 1000;
	}

	.window {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		border-radius: 10px;
		overflow: hidden;
		box-shadow:
			0 0 0 0.5px rgb(255 255 255 / 0.12),
			0 28px 70px rgb(0 0 0 / 0.45),
			0 8px 20px rgb(0 0 0 / 0.25);
		background: #ececec;
		color: #1d1d1f;
		pointer-events: none;
	}

	.titlebar {
		position: relative;
		flex-shrink: 0;
		height: 36px;
		background: linear-gradient(180deg, #e8e8e8 0%, #dcdcdc 100%);
		border-bottom: 1px solid #b8b8b8;
		pointer-events: none;
	}

	.titlebar-body {
		position: absolute;
		inset: 8px 18px 0;
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0 0.5rem;
		cursor: grab;
		user-select: none;
		pointer-events: auto;
	}

	.titlebar-body:active {
		cursor: grabbing;
	}

	.traffic {
		display: flex;
		gap: 6px;
	}

	.dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 0.5px rgb(0 0 0 / 0.12);
	}

	.close {
		background: #ff5f57;
	}
	.min {
		background: #febc2e;
	}
	.max {
		background: #28c840;
	}

	.title {
		flex: 1;
		text-align: center;
		font-size: 0.75rem;
		font-weight: 600;
		color: #3a3a3c;
		margin-right: 2.5rem;
		pointer-events: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.5rem;
		background: #f5f5f7;
		border-bottom: 1px solid #d1d1d6;
		font-size: 0.7rem;
		color: #636366;
		flex-shrink: 0;
	}

	.tb-btn {
		width: 1.1rem;
		text-align: center;
	}

	.tb-path {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.content {
		flex: 1;
		min-height: 0;
		background: #fff;
	}

	.finder-content {
		display: flex;
	}

	.sidebar {
		width: 6.5rem;
		padding: 0.45rem 0.3rem;
		border-right: 1px solid #e5e5ea;
		background: #fbfbfc;
		font-size: 0.65rem;
		flex-shrink: 0;
	}

	.side-label {
		margin: 0 0 0.3rem 0.35rem;
		color: #8e8e93;
		font-weight: 600;
		text-transform: uppercase;
	}

	.sidebar ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.sidebar li {
		padding: 0.15rem 0.4rem;
		border-radius: 4px;
	}

	.sidebar li.active {
		background: #007aff;
		color: #fff;
	}

	.files {
		flex: 1;
		padding: 0.6rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(4.5rem, 1fr));
		gap: 0.5rem;
		align-content: start;
		font-size: 0.65rem;
	}

	.file {
		text-align: center;
		padding: 0.25rem;
		border-radius: 5px;
	}

	.notes-content {
		padding: 0.85rem 1rem;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.notes-content p {
		margin: 0 0 0.5rem;
	}

	.dim {
		opacity: 0.65;
		font-size: 0.75rem;
	}
</style>
