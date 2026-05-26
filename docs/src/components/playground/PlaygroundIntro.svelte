<script lang="ts">
	import { DEFAULT_WORLD, WORLDS, type WorldId } from './worlds';
	import ScenarioStrip from './ScenarioStrip.svelte';

	type Props = {
		world?: WorldId;
		onworld?: (id: WorldId) => void;
	};

	const { world = DEFAULT_WORLD, onworld }: Props = $props();

	const world_meta = $derived(WORLDS.find((w) => w.id === world));
</script>

<header
	class="relative grid grid-cols-1 gap-6 overflow-hidden py-1 pb-5 min-[900px]:grid-cols-[1fr_minmax(14rem,22rem)] min-[900px]:items-start min-[900px]:gap-10"
>
	<p
		class="pointer-events-none absolute top-[-0.15em] right-[-0.05em] m-0 font-mono text-[clamp(5rem,18vw,9rem)] leading-none font-black tracking-[-0.06em] text-primary/8 select-none"
		aria-hidden="true"
	>
		v3
	</p>

	<div class="relative grid max-w-[40rem] gap-2.5">
		<p
			class="m-0 font-mono text-[clamp(0.62rem,1.2vw,0.7rem)] font-semibold tracking-[0.18em] text-[var(--pg-muted)] uppercase"
		>
			<span class="text-primary" aria-hidden="true">▍</span>
			playground · plugins first · 2026
		</p>

		<h1
			class="m-0 w-max max-w-full text-[clamp(2.75rem,11vw,5.5rem)] leading-[0.92] font-extrabold tracking-[-0.045em] text-fg"
		>
			<span class="font-semibold italic">neo</span><span class="font-extrabold text-primary not-italic"
				>/</span
			><span class="border-b-4 border-primary pb-px font-extrabold">drag</span>
		</h1>

		<p class="m-0 mt-1 max-w-[36rem] text-[clamp(1rem,2vw,1.0625rem)] leading-[1.55] text-[var(--pg-muted)]">
			<strong class="font-bold text-fg">Everything&rsquo;s a plugin</strong> — mostly built-ins, plus your own.
			One engine for Svelte, React, Vue, Solid, and vanilla.
		</p>

		{#if world_meta}
			<p class="m-0 mt-0.5 font-mono text-[0.8rem] text-[var(--pg-muted-soft)]">
				<span class="mr-1.5 font-bold tracking-[0.12em] text-primary uppercase">scene</span>
				{world_meta.label}
				<span class="opacity-50">·</span>
				{world_meta.tagline}
			</p>
		{/if}

		<div class="mt-3 flex flex-wrap gap-2.5">
			<a
				class="unstyled inline-flex items-center justify-center border-[0.2px] border-primary/88 bg-primary px-[1.15rem] py-2.5 font-mono text-[0.78rem] font-extrabold tracking-[0.08em] text-primary-contrast uppercase transition-[background-color,border-color,letter-spacing] duration-75 hover:tracking-[0.1em] hover:bg-[color-mix(in_lch,var(--app-color-primary),var(--app-color-anti-mixer)_12%)]"
				href="/docs/svelte"
			>
				Getting started
			</a>
			<a
				class="unstyled inline-flex items-center justify-center border-[0.2px] border-[var(--pg-border-strong)] bg-transparent px-[1.15rem] py-2.5 font-mono text-[0.78rem] font-extrabold tracking-[0.08em] text-fg uppercase transition-[background-color,border-color,color] duration-75 hover:border-primary/65 hover:bg-primary/8 hover:text-primary"
				href="https://github.com/PuruVJ/neodrag"
				target="_blank"
				rel="external"
			>
				GitHub
			</a>
		</div>
	</div>

	{#if onworld}
		<div
			class="grid gap-2.5 border-[0.2px] border-[var(--pg-border)] bg-[var(--pg-panel)] p-3.5 min-[900px]:mt-10"
		>
			<p class="m-0 font-mono text-[clamp(0.62rem,1.2vw,0.7rem)] font-semibold tracking-[0.18em] text-primary uppercase">
				<span aria-hidden="true">▍</span>
				scenarios
			</p>
			<ScenarioStrip active={world} onselect={onworld} />
		</div>
	{/if}
</header>
