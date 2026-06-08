<script lang="ts">
	import { Neodrag } from '../../src/index.ts';
	import { dragData } from '../../src/plugins.ts';
	import { accepts, highlight } from '../../src/drop/index.ts';
	import { stableDraggable, stableDroppable } from '../bind-harness.ts';

	const {
		acceptKind = 'card',
		overClass = 'drop-over',
	}: {
		acceptKind?: string;
		overClass?: string;
	} = $props();

	const engine = new Neodrag();
	const bindDrop = stableDroppable(engine, () => [
		accepts<{ kind: string }>((d) => d.kind === acceptKind),
		highlight({ overClass }),
	])();

	const bindAccepted = stableDraggable(engine, () => [dragData(() => ({ kind: 'card' }))]);
	const bindRejected = stableDraggable(engine, () => [dragData(() => ({ kind: 'other' }))]);
</script>

<div class="scene">
	<div class="drop" data-testid="dropzone" {@attach bindDrop}>
		<div class="box" data-testid="draggable-accepted" {@attach bindAccepted('accepted')}></div>
	</div>
	<div class="box rejected" data-testid="draggable-rejected" {@attach bindRejected('rejected')}></div>
</div>

<style>
	.scene {
		position: relative;
		width: 400px;
		height: 300px;
	}
	.drop {
		position: relative;
		width: 280px;
		height: 220px;
		border: 2px dashed #333;
		box-sizing: border-box;
	}
	.box {
		position: absolute;
		left: 20px;
		top: 20px;
		width: 60px;
		height: 60px;
		background: cyan;
	}
	.rejected {
		left: 320px;
		top: 20px;
		background: #faa;
	}
	:global(.drop-over) {
		outline: 3px solid lime;
	}
</style>
