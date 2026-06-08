<script lang="ts">
	import {
		fuzzDrag,
		midpointThrash,
		randomSeed,
		scribbleInPlace,
		wildDrag,
		wildDropApproach,
		wildReorder,
		wildResize,
		type Intensity,
	} from '@neodrag/test';

	const {
		tab,
		getTargets,
	}: {
		tab: 'drag' | 'sortable' | 'drop' | 'resize';
		getTargets: () => {
			draggable?: HTMLElement;
			dropzone?: HTMLElement;
			list?: HTMLElement;
			item?: HTMLElement;
			neighbor?: HTMLElement;
			resizeBox?: HTMLElement;
		};
	} = $props();

	let seed = $state(randomSeed());
	let intensity = $state<Intensity>('wild');
	let lastSeed = $state<number | null>(null);
	let status = $state('');

	async function runGesture(name: string) {
		const t = getTargets();
		status = `Running ${name}…`;
		lastSeed = seed;
		try {
			if (tab === 'drag' && t.draggable) {
				if (name === 'wildDrag') await wildDrag(t.draggable, t.draggable, { seed, intensity, mode: 'realtime' });
				else if (name === 'scribble') await scribbleInPlace(t.draggable, { seed, intensity, mode: 'realtime' });
				else await fuzzDrag(t.draggable, { seed, intensity, mode: 'realtime' });
			} else if (tab === 'drop' && t.draggable && t.dropzone) {
				if (name === 'wildDrop') await wildDropApproach(t.draggable, t.dropzone, { seed, intensity, mode: 'realtime' });
				else await wildDrag(t.draggable, t.dropzone, { seed, intensity, mode: 'realtime' });
			} else if (tab === 'sortable' && t.item && t.list) {
				if (name === 'wildReorder') await wildReorder(t.item, 2, t.list, { seed, intensity, mode: 'realtime' });
				else if (t.neighbor) await midpointThrash(t.item, t.neighbor, { seed, intensity, mode: 'realtime', passes: 6 });
			} else if (tab === 'resize' && t.resizeBox) {
				await wildResize(t.resizeBox, 'se', { seed, intensity, mode: 'realtime', zigzag: true });
			}
			status = `Done (seed ${seed})`;
		} catch (e) {
			status = `Error: ${e instanceof Error ? e.message : String(e)}`;
		}
	}

	function newSeed() {
		seed = randomSeed();
	}

	function replay() {
		if (lastSeed != null) seed = lastSeed;
	}
</script>

<aside class="fuzz-panel">
	<h3>Realness fuzz</h3>
	<label>
		Seed
		<input type="number" bind:value={seed} />
	</label>
	<button type="button" onclick={newSeed}>Random seed</button>
	<button type="button" onclick={replay} disabled={lastSeed == null}>Replay last</button>
	<label>
		Intensity
		<select bind:value={intensity}>
			<option value="tame">tame</option>
			<option value="normal">normal</option>
			<option value="wild">wild</option>
			<option value="chaotic">chaotic</option>
		</select>
	</label>
	<div class="actions">
		{#if tab === 'drag'}
			<button type="button" onclick={() => runGesture('wildDrag')}>Wild drag</button>
			<button type="button" onclick={() => runGesture('scribble')}>Scribble in place</button>
			<button type="button" onclick={() => runGesture('fuzz')}>Fuzz drag</button>
		{:else if tab === 'drop'}
			<button type="button" onclick={() => runGesture('wildDrop')}>Wild drop approach</button>
			<button type="button" onclick={() => runGesture('wildDrag')}>Wild drag to zone</button>
		{:else if tab === 'sortable'}
			<button type="button" onclick={() => runGesture('wildReorder')}>Wild reorder</button>
			<button type="button" onclick={() => runGesture('thrash')}>Midpoint thrash</button>
		{:else}
			<button type="button" onclick={() => runGesture('wildResize')}>Wild resize SE</button>
		{/if}
	</div>
	<p class="status">{status}</p>
</aside>

<style>
	.fuzz-panel {
		margin-top: 16px;
		padding: 12px;
		border: 1px solid #ccc;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 320px;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.status {
		font-size: 12px;
		color: #444;
		margin: 0;
	}
</style>
