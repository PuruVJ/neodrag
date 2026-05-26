<script lang="ts">
	type Props = {
		compact?: boolean;
		pathname: string;
		nav_list: ReturnType<typeof import('$/nav').get_nav_list>;
		onclick?: () => void;
	};

	const { compact = false, pathname, nav_list, onclick }: Props = $props();

	const aria_current_val = (path: string) => (pathname?.endsWith(path) ? 'page' : 'false');
</script>

<div class="flex h-full flex-col gap-4 overflow-x-hidden overflow-y-auto p-2">
	{#if !compact}
		<a
			href="/"
			class="unstyled m-1 flex items-center gap-2 font-semibold text-fg min-[968px]:m-4"
		>
			<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" class="w-12" />
			<span class="h3 m-0 font-heading text-xl">Neodrag</span>
		</a>
	{/if}

	<nav class="flex-1 px-1">
		{#each nav_list as { title, sections }, index}
			<ul class="m-0 list-none p-0">
				<div class="site-kicker mb-2">{title}</div>
				{#each sections as { slug, title }}
					<li class={compact ? 'py-0.5' : 'py-1'}>
						<a
							href={slug}
							aria-current={aria_current_val(slug)}
							class={[
								'unstyled block border-2 border-transparent px-3 py-1.5 font-mono text-sm font-semibold text-[color-mix(in_lch,var(--app-color-dark),transparent_12%)] transition-[background-color,border-color,color] duration-75 dock-angular-chip',
								aria_current_val(slug) === 'page' &&
									'border-brand bg-[color-mix(in_lch,var(--color-brand),transparent_88%)] font-extrabold text-fg',
							]}
							{onclick}
						>
							{title}
						</a>
					</li>
				{/each}
			</ul>

			{#if index !== nav_list.length - 1}
				<hr
					class="my-4 h-0.5 border-0 bg-gradient-to-r from-brand via-[color-mix(in_lch,var(--color-brand),transparent_70%)] to-transparent"
				/>
			{/if}
		{/each}
	</nav>
</div>
