<script lang="ts">
	import data from '$/sizes.json';
	import {
		bitmaskFromKeys,
		DRAG_DEFAULT_NAMES,
		formatBytes,
		lookupSize,
	} from '$/lib/sizes-data.ts';
	import TickIcon from '~icons/material-symbols/check';

	const defaultOptionalDrag = Object.entries(data.drag.keys)
		.filter(([, name]) => !DRAG_DEFAULT_NAMES.includes(name as (typeof DRAG_DEFAULT_NAMES)[number]))
		.filter(([, name]) => ['axis', 'grid', 'bounds', 'position'].includes(name))
		.map(([k]) => k);

	let selectedDrag = $state<string[]>([...defaultOptionalDrag]);
	let selectedDrop = $state<string[]>([]);
	let includeSortable = $state(false);

	const dragMask = $derived(bitmaskFromKeys(selectedDrag, data.drag.keys));
	const dropMask = $derived(bitmaskFromKeys(selectedDrop, data.drop.keys));

	const dragBytes = $derived(lookupSize(data.drag.sizes, dragMask));
	const dragBaseBytes = $derived(lookupSize(data.drag.sizes, 0));
	const dropBytes = $derived(lookupSize(data.drop.sizes, dropMask));
	const dropBaseBytes = $derived(lookupSize(data.drop.sizes, 0));
	const dropMarginal = $derived(Math.max(0, dropBytes - dropBaseBytes));
	const sortableMarginal = $derived(
		includeSortable ? Math.max(0, data.extras.sortable - data.extras.engineMinimal) : 0,
	);

	const totalBytes = $derived(dragBytes + dropMarginal + sortableMarginal);
	const deltaFromDefaults = $derived(Math.max(0, totalBytes - dragBaseBytes));

	const presetEntries = $derived(Object.entries(data.presets));

	function applyPreset(drag: string[], drop: string[], sortable: boolean) {
		selectedDrag = drag
			.map((name) => Object.entries(data.drag.keys).find(([, v]) => v === name)?.[0])
			.filter((k): k is string => k !== undefined);
		selectedDrop = drop
			.map((name) => Object.entries(data.drop.keys).find(([, v]) => v === name)?.[0])
			.filter((k): k is string => k !== undefined);
		includeSortable = sortable;
	}
</script>

<div class="demo">
	<div class="intro-copy">
		<h2>Transparent bundle size</h2>
		<p>
			Brotli-minified estimates for <code>@neodrag/core</code> v3. Default drag plugins are always
			included; toggles add optional drag, drop, or sortable helpers.
			<a target="_blank" rel="external" href="https://www.puruvj.dev/blog/neodrag-16k-bundle-combos"
				>Learn more</a
			>
		</p>
	</div>

	<div class="size-panel" aria-live="polite">
		<p class="size-total">{formatBytes(totalBytes)}</p>
		<p class="size-delta">+{formatBytes(deltaFromDefaults)} over default drag stack</p>
		<ul class="size-breakdown">
			<li><span>Default stack</span><span>{formatBytes(dragBaseBytes)}</span></li>
			<li>
				<span>Your optional drag</span><span
					>{formatBytes(Math.max(0, dragBytes - dragBaseBytes))}</span
				>
			</li>
			<li><span>Drop targets</span><span>+{formatBytes(dropMarginal)}</span></li>
			{#if includeSortable}
				<li><span>Sortable helper</span><span>+{formatBytes(sortableMarginal)}</span></li>
			{/if}
		</ul>
	</div>

	{#if presetEntries.length > 0}
		<div class="presets">
			<p class="section-label">Quick presets</p>
			<div class="preset-row">
				{#each presetEntries as [id, preset]}
					<button
						type="button"
						class="preset-chip"
						onclick={() => applyPreset(preset.drag, preset.drop, id === 'sortableList')}
					>
						{preset.label}
						<span class="preset-size">{formatBytes(preset.bytes)}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<fieldset class="plugin-group">
		<legend>Optional drag plugins</legend>
		<p class="hint">
			Measured on top of the built-in default stack ({DRAG_DEFAULT_NAMES.join(', ')}).
		</p>
		<div class="checkbox-grid">
			{#each Object.entries(data.drag.keys) as [key, name]}
				<label class="checkbox-item" class:selected={selectedDrag.includes(key)}>
					<input type="checkbox" value={key} bind:group={selectedDrag} class="sr-only" />
					<span class="checkbox-display">
						<span class="icon" aria-hidden="true"><TickIcon /></span>
						<span class="label-text">{name}</span>
					</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<fieldset class="plugin-group">
		<legend>Drop target plugins</legend>
		<p class="hint">Marginal size over registering an empty <code>droppable()</code> zone.</p>
		<div class="checkbox-grid">
			{#each Object.entries(data.drop.keys) as [key, name]}
				<label class="checkbox-item" class:selected={selectedDrop.includes(key)}>
					<input type="checkbox" value={key} bind:group={selectedDrop} class="sr-only" />
					<span class="checkbox-display">
						<span class="icon" aria-hidden="true"><TickIcon /></span>
						<span class="label-text">{name}</span>
					</span>
				</label>
			{/each}
		</div>
	</fieldset>

	<fieldset class="plugin-group extras">
		<legend>Extras</legend>
		<label class="checkbox-item sortable-toggle" class:selected={includeSortable}>
			<input type="checkbox" bind:checked={includeSortable} class="sr-only" />
			<span class="checkbox-display">
				<span class="icon" aria-hidden="true"><TickIcon /></span>
				<span class="label-text">sortable (from <code>@neodrag/core/sortable</code>)</span>
			</span>
		</label>
	</fieldset>

	<p class="footnote">
		Engine-only floor: {formatBytes(data.extras.engineMinimal)}. Regenerate with
		<code>pnpm sizes</code> in <code>docs/scripts</code> after changing core.
	</p>
</div>

<style>
	.demo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		width: min(100%, 42rem);
		margin-inline: auto;
	}

	.intro-copy {
		text-align: center;
	}

	.intro-copy p {
		font-size: clamp(1rem, 2vw, 1.15rem);
		max-width: 40ch;
		margin-inline: auto;
	}

	.intro-copy code {
		font-family: var(--app-font-mono);
		font-size: 0.9em;
	}

	.size-panel {
		width: 100%;
		padding: 1.25rem 1.5rem;
		border-radius: 1rem;
		background: color-mix(in lch, var(--app-color-primary), transparent 92%);
		text-align: center;
	}

	.size-total {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(2rem, 6vw, 3rem);
		font-weight: 700;
		line-height: 1.1;
	}

	.size-delta {
		margin: 0.35rem 0 0;
		font-family: var(--app-font-mono);
		font-size: 1.1rem;
		opacity: 0.85;
	}

	.size-breakdown {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
		font-family: var(--app-font-mono);
		font-size: 0.85rem;
		text-align: left;
	}

	.size-breakdown li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-label {
		margin: 0;
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.7;
		text-align: center;
	}

	.presets {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.preset-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.preset-chip {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.15rem;
		padding: 0.5rem 0.85rem;
		border: 1px solid color-mix(in lch, var(--app-color-primary), transparent 70%);
		border-radius: 999px;
		background: color-mix(in lch, var(--app-color-shell), var(--app-color-primary) 8%);
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition:
			background-color 0.12s ease,
			transform 0.12s ease;
	}

	.preset-chip:hover {
		background: color-mix(in lch, var(--app-color-primary), transparent 85%);
		transform: translateY(-1px);
	}

	.preset-size {
		font-family: var(--app-font-mono);
		font-size: 0.75rem;
		opacity: 0.8;
	}

	.plugin-group {
		width: 100%;
		border: none;
		padding: 0;
		margin: 0;
	}

	.plugin-group legend {
		font-size: 1.1rem;
		font-weight: 600;
		text-align: center;
		width: 100%;
		padding: 0 0 0.5rem;
	}

	.hint {
		text-align: center;
		font-size: 0.9rem;
		margin: 0 0 0.75rem;
		opacity: 0.8;
	}

	.hint code {
		font-family: var(--app-font-mono);
		font-size: 0.85em;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.checkbox-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.65rem;
		justify-content: center;
	}

	.checkbox-item {
		position: relative;
		cursor: pointer;
	}

	.checkbox-display {
		display: flex;
		align-items: center;
		padding: 0.45rem 1.5rem 0.45rem 2rem;
		border-radius: 2rem;
		background-color: color-mix(in lch, var(--app-color-primary), transparent 90%);
		color: var(--app-color-primary-contrast);
		box-shadow:
			0 4px 6px rgba(3, 7, 18, 0.06),
			0 12px 20px rgba(3, 7, 18, 0.05);
		transition:
			background-color 0.12s ease,
			transform 0.12s ease,
			box-shadow 0.12s ease;
		user-select: none;
		font-size: 0.95rem;
	}

	.checkbox-item:focus-within .checkbox-display {
		outline: 2px solid var(--app-color-primary);
		outline-offset: 2px;
	}

	.checkbox-item:hover .checkbox-display {
		transform: translateY(-1px);
	}

	.checkbox-item.selected .checkbox-display {
		background-color: color-mix(in lch, var(--app-color-primary), transparent 68%);
	}

	.checkbox-item.selected .icon {
		opacity: 1;
	}

	.icon {
		opacity: 0;
		position: absolute;
		left: 10px;
		top: 50%;
		translate: 0 -50%;
		transition: opacity 0.12s ease;
	}

	.sortable-toggle .checkbox-display {
		padding-left: 2rem;
	}

	.footnote {
		font-size: 0.8rem;
		text-align: center;
		opacity: 0.65;
		margin: 0;
	}

	.footnote code {
		font-family: var(--app-font-mono);
	}
</style>
