<script lang="ts">
	import type { Framework } from '$helpers/constants';
	import type { Snippet } from 'svelte';
	import CheckIcon from '~icons/mdi/check';
	import ContentCopyIcon from '~icons/mdi/content-copy';
	import { FRAMEWORK_TABS } from './frameworks';
	import { get_snippet } from './snippet-templates';
	import type { WorldId } from './worlds';

	type Props = {
		world: WorldId;
		framework: Framework;
		onframework: (id: Framework) => void;
		snippets?: Snippet;
	};

	const { world, framework, onframework, snippets }: Props = $props();

	const snippet_text = $derived(get_snippet(world, framework));
	const active_tab = $derived(FRAMEWORK_TABS.find((t) => t.id === framework));

	let copied = $state(false);
	let copy_timer: ReturnType<typeof setTimeout> | undefined;
	let snippets_host: HTMLDivElement | undefined;

	async function copy_snippet() {
		await navigator.clipboard.writeText(snippet_text);
		copied = true;
		clearTimeout(copy_timer);
		copy_timer = setTimeout(() => (copied = false), 1600);
	}

	const docs_href = $derived(active_tab?.docsPath ?? '/docs/svelte');

	function sync_visible_snippet() {
		if (!snippets_host) return;

		for (const block of snippets_host.querySelectorAll<HTMLElement>('.playground-snippet')) {
			const match =
				block.dataset.world === world && block.dataset.framework === framework;
			block.toggleAttribute('hidden', !match);
		}
	}

	$effect(() => {
		world;
		framework;
		sync_visible_snippet();
	});
</script>

<aside
	class="code-panel flex min-h-0 min-w-0 flex-col pl-0 max-[1100px]:min-h-64 max-[1100px]:pt-3 min-[1101px]:pl-5"
	aria-label="Code for this scene"
>
	<header class="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
		<div
			class="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[clamp(0.72rem,1.3vw,0.8125rem)] text-[var(--pg-muted)]"
			aria-hidden="true"
		>
			<span class="font-black text-primary">$</span>
			<span class="font-semibold text-fg">neodrag</span>
			<span class="opacity-55">--adapter</span>
			<span class="font-bold text-fg">{active_tab?.label ?? framework}</span>
		</div>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="grid size-8 place-items-center border-[0.2px] border-[var(--pg-border)] text-[var(--pg-muted)] transition-[border-color,color,background-color] duration-75 hover:border-primary/50 hover:bg-primary/8 hover:text-primary"
				title="Copy snippet"
				onclick={copy_snippet}
			>
				{#if copied}
					<CheckIcon class="size-[1.05rem]" />
				{:else}
					<ContentCopyIcon class="size-[1.05rem]" />
				{/if}
			</button>
			<a
				class="unstyled border-[0.2px] border-[var(--pg-border-strong)] bg-transparent px-3 py-1.5 font-mono text-[0.72rem] font-extrabold tracking-[0.06em] text-fg uppercase transition-[border-color,color,background-color] duration-75 hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
				href={docs_href}
			>
				docs →
			</a>
		</div>
	</header>

	<div
		class="mb-3 flex flex-wrap items-center gap-1.5 border-b-[0.2px] border-[var(--pg-border)] pb-2.5"
		role="tablist"
		aria-label="Framework"
	>
		<span
			class="w-full font-mono text-[0.6rem] font-semibold tracking-[0.18em] text-[var(--pg-muted-soft)] uppercase"
			aria-hidden="true"
		>
			adapters ▸
		</span>
		{#each FRAMEWORK_TABS as tab (tab.id)}
			{@const selected = framework === tab.id}
			<button
				type="button"
				role="tab"
				aria-selected={selected}
				data-framework={tab.id}
				class={[
					'border-[0.2px] px-2.5 py-1.5 font-mono text-[0.7rem] font-semibold tracking-[0.06em] uppercase transition-[border-color,color,background-color] duration-75',
					selected
						? 'border-primary/88 bg-primary text-primary-contrast'
						: 'border-[var(--pg-border)] bg-transparent text-[var(--pg-muted)] hover:border-primary/55 hover:bg-primary/6 hover:text-primary',
				]}
				onclick={() => onframework(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div
		class="code-body min-h-56 flex-1 overflow-auto border-[0.2px] border-[var(--pg-border-strong)] bg-[var(--pg-code-bg)] p-3.5 text-[clamp(0.75rem,1.15vw,0.875rem)] leading-normal shadow-[inset_0_0_0_1px_var(--pg-code-inset)] focus-within:border-primary/65 focus-within:shadow-[0_0_0_3px_color-mix(in_lch,var(--app-color-primary),transparent_88%)]"
		bind:this={snippets_host}
	>
		{#if snippets}
			{@render snippets()}
		{/if}
	</div>
</aside>
