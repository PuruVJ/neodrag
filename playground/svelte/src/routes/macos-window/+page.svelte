<script lang="ts">
	import { Length, Neodrag } from '@neodrag/core';
	import { Draggable } from '@neodrag/svelte';
	import { ControlFrom, controls } from '@neodrag/svelte/plugins';
	import { Resizable, resizeHandles } from '@neodrag/svelte/resize';

	const engine = new Neodrag({ dev: false });
	const length = new Length({ units: 'preserve' });

	const drag = new Draggable({
		engine,
		plugins: [controls({ allow: ControlFrom.selector('[data-window-drag]') })],
		threshold: null,
	});

	const resize = new Resizable({
		engine,
		length,
		minSize: { width: 220, height: 140 },
		maxSize: { width: 'min(92vw, 720px)', height: 'min(82vh, 520px)' },
		plugins: [resizeHandles({ edges: 'all', size: 10, cornerSize: 22 })],
	});
</script>

<svelte:head>
	<title>macOS window — Neodrag playground</title>
</svelte:head>

<main class="desktop">
	<p class="hint">Drag the title bar · resize from edges and corners</p>

	<div class="window-shell" {@attach drag.attachment} {@attach resize.attachment}>
		<div class="window">
		<header class="titlebar">
			<div class="titlebar-body" data-window-drag>
				<div class="traffic" aria-hidden="true">
					<span class="dot close"></span>
					<span class="dot min"></span>
					<span class="dot max"></span>
				</div>
				<span class="title">Finder — Documents</span>
			</div>
		</header>
		<div class="toolbar">
			<span class="tb-btn">‹</span>
			<span class="tb-btn">›</span>
			<span class="tb-path">Macintosh HD · Documents · Neodrag</span>
		</div>
		<div class="content">
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
				<div class="file">📄 notes.txt</div>
			</div>
		</div>
		</div>
	</div>
</main>

<style>
	:global(body) {
		margin: 0;
		min-height: 100vh;
		font-family:
			-apple-system,
			BlinkMacSystemFont,
			'SF Pro Text',
			'Segoe UI',
			system-ui,
			sans-serif;
	}

	.desktop {
		min-height: 100vh;
		padding: 2.5rem 1.5rem 3rem;
		box-sizing: border-box;
		background:
			radial-gradient(ellipse 120% 80% at 20% 0%, #5b8fd9 0%, transparent 55%),
			radial-gradient(ellipse 90% 70% at 90% 10%, #c084fc 0%, transparent 50%),
			linear-gradient(165deg, #1a3a5c 0%, #2d1b4e 40%, #0f172a 100%);
	}

	.hint {
		margin: 0 0 1.25rem;
		color: rgb(255 255 255 / 0.75);
		font-size: 0.875rem;
		text-align: center;
	}

	.window-shell {
		position: absolute;
		left: clamp(1rem, 12vw, 8rem);
		top: clamp(3rem, 14vh, 6rem);
		width: min(520px, 88vw);
		height: min(340px, 70vh);
		touch-action: none;
	}

	.window-shell :global([data-neodrag-resize-handle]) {
		pointer-events: auto;
		z-index: 1000;
	}

	.window-shell :global([data-neodrag-resize-handle='ne']),
	.window-shell :global([data-neodrag-resize-handle='nw']),
	.window-shell :global([data-neodrag-resize-handle='se']),
	.window-shell :global([data-neodrag-resize-handle='sw']) {
		z-index: 1001;
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
		height: 38px;
		background: linear-gradient(180deg, #e8e8e8 0%, #dcdcdc 100%);
		border-bottom: 1px solid #b8b8b8;
		pointer-events: none;
	}

	.titlebar-body {
		position: absolute;
		inset: 10px 22px 0;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 0.75rem 0 0.65rem;
		cursor: grab;
		user-select: none;
		pointer-events: auto;
	}

	.titlebar-body:active {
		cursor: grabbing;
	}

	.traffic {
		display: flex;
		gap: 7px;
		align-items: center;
	}

	.dot {
		width: 12px;
		height: 12px;
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
		font-size: 0.8125rem;
		font-weight: 600;
		color: #3a3a3c;
		margin-right: 3.5rem;
		pointer-events: none;
	}

	.toolbar {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.5rem;
		background: #f5f5f7;
		border-bottom: 1px solid #d1d1d6;
		font-size: 0.75rem;
		color: #636366;
		flex-shrink: 0;
	}

	.tb-btn {
		width: 1.25rem;
		text-align: center;
		border-radius: 4px;
		line-height: 1.25rem;
	}

	.tb-path {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.content {
		display: flex;
		flex: 1;
		min-height: 0;
		background: #fff;
	}

	.sidebar {
		width: 7.5rem;
		padding: 0.5rem 0.35rem;
		border-right: 1px solid #e5e5ea;
		background: #fbfbfc;
		font-size: 0.6875rem;
		flex-shrink: 0;
	}

	.side-label {
		margin: 0 0 0.35rem 0.4rem;
		color: #8e8e93;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.sidebar ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.sidebar li {
		padding: 0.2rem 0.45rem;
		border-radius: 5px;
		color: #3a3a3c;
	}

	.sidebar li.active {
		background: #007aff;
		color: #fff;
	}

	.files {
		flex: 1;
		padding: 0.75rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(5.5rem, 1fr));
		gap: 0.75rem;
		align-content: start;
		font-size: 0.6875rem;
	}

	.file {
		display: grid;
		place-items: center;
		text-align: center;
		gap: 0.25rem;
		padding: 0.35rem;
		border-radius: 6px;
	}

	.file:hover {
		background: rgb(0 122 255 / 0.1);
	}
</style>
