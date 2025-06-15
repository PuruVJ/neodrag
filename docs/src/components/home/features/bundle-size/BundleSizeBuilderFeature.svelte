<script lang="ts">
	import sizes_json from '$/sizes.json?raw';
	import TickIcon from '~icons/material-symbols/check';

	const DEFAULT_PLUGINS = [
		'ignoreMultitouch',
		'stateMarker',
		'applyUserSelectHack',
		'transform',
		'threshold',
		'touchAction',
	];

	const sizes_data = JSON.parse(sizes_json);

	const default_indices = DEFAULT_PLUGINS.map(
		(p) => Object.entries(sizes_data.keys).find(([, k]) => k === p)?.[0],
	) as string[];

	function find_combination_size(plugin_keys: string[]): number {
		// Convert plugin indices to bitmask
		let bitmask = 0;
		for (const key of plugin_keys) {
			const plugin_index = parseInt(key);
			if (!isNaN(plugin_index)) {
				bitmask |= 1 << plugin_index;
			}
		}

		// Convert bitmask to string key for lookup
		const lookup_key = bitmask.toString();

		// Look up the exact combination
		if (lookup_key in sizes_data.sizes) {
			return sizes_data.sizes[lookup_key];
		} else {
			// Return base size as fallback (bitmask 0)
			return sizes_data.sizes['0'] || 0;
		}
	}

	function conditional_format(bytes: number) {
		if (bytes < 1024) return bytes.toFixed(2) + 'B';

		return (bytes / 1024).toFixed(2) + 'KB';
	}

	const checkboxes = $state<Record<string, HTMLInputElement>>({});

	let selected = $state<string[]>(default_indices);
	let current_size = $derived(find_combination_size(selected));
	let current_size_kb = $derived(conditional_format(current_size));
	let delta_size_kb = $derived(conditional_format(current_size - sizes_data.sizes['0']));
</script>

<div class="demo">
	<h2>Transparent bundle size</h2>
	<p>
		Figure out which plugins will cost how many bytes. <a
			target="_blank"
			rel="external"
			href="https://www.puruvj.dev/blog/neodrag-16k-bundle-combos">Learn more</a
		>
	</p>

	<br />

	<h3 class="h1">{current_size_kb}</h3>
	<h4 class="h3">+{delta_size_kb}</h4>

	<br /><br />

	<p>Select the plugins you want to include in your bundle</p>
	<ul>
		{#each Object.entries(sizes_data.keys) as [key, value]}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<li
				class={[selected.includes(key as any) && 'selected']}
				onclick={() => {
					checkboxes[key as any].click();
				}}
			>
				<span class="icon"><TickIcon /></span>

				<label
					onclick={() => {
						checkboxes[key as any].click();
					}}
				>
					<input
						type="checkbox"
						value={key}
						bind:group={selected}
						bind:this={checkboxes[key as any]}
					/>

					{value}
				</label>
			</li>
		{/each}
	</ul>
</div>

<style>
	.demo {
		display: grid;
		place-items: center;
	}

	ul {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		justify-content: center;

		list-style-type: none;
	}

	.h1,
	.h3 {
		margin: 0;
		font-family: var(--app-font-mono);
		font-weight: 660;
	}

	li {
		position: relative;
		padding: 0.5rem 2rem;
		border-radius: 2rem;
		background-color: color-mix(in lch, var(--app-color-primary), transparent 90%);
		color: var(--app-color-primary-contrast);
		box-shadow:
			0px 5px 6px rgba(3, 7, 18, 0.06),
			0px 18px 24px rgba(3, 7, 18, 0.06);

		transition: background 0.12s ease-in;

		user-select: none;

		&.selected {
			background-color: color-mix(in lch, var(--app-color-primary), transparent 70%);

			.icon {
				opacity: 1;
			}
		}
	}

	label {
		display: flex;
		font-size: large;
	}

	.icon {
		opacity: 0;
		position: absolute;
		left: 10px;
		top: 50%;
		translate: 0 -50%;

		transition: opacity 0.12s ease-in;
	}

	input[type='checkbox'] {
		display: none;
	}
</style>
