<script lang="ts">
	import { WORLDS, type WorldId } from './worlds';

	type Props = {
		active: WorldId;
		onselect: (id: WorldId) => void;
	};

	const { active, onselect }: Props = $props();
</script>

<nav class="flex flex-col gap-1.5" aria-label="Playground scenarios">
	{#each WORLDS as world, i (world.id)}
		{@const selected = active === world.id}
		<button
			type="button"
			class={[
				'grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-2 border-[0.2px] px-2 py-2 text-left font-mono text-[0.78rem] transition-[background-color,border-color,color,padding-left] duration-75',
				selected
					? 'border-primary/85 bg-primary text-primary-contrast'
					: 'border-transparent bg-transparent text-[var(--pg-muted)] hover:pl-3 hover:bg-primary/6 hover:text-fg',
				!world.available && 'cursor-not-allowed opacity-[0.42]',
			]}
			disabled={!world.available}
			title={world.available ? world.tagline : 'Coming soon'}
			onclick={() => world.available && onselect(world.id)}
		>
			<span
				class={[
					'font-black tabular-nums',
					selected ? 'text-primary-contrast/75' : 'text-[var(--pg-muted-soft)]',
				]}
				aria-hidden="true"
			>
				{String(i + 1).padStart(2, '0')}
			</span>
			<span class="font-bold">{world.label}</span>
			{#if !world.available}
				<span class="text-[0.62rem] font-bold tracking-[0.1em] uppercase opacity-80">soon</span>
			{/if}
		</button>
	{/each}
</nav>
