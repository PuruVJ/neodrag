<script lang="ts">
	type Props = {
		compact?: boolean;
		pathname: string;
		nav_list: ReturnType<typeof import('$/nav').get_nav_list>;
		onclick?: () => void;
	};

	const { compact = false, pathname, nav_list, onclick }: Props = $props();

	const active_slug = $derived.by(() => {
		if (!pathname) return null;
		let best: string | null = null;
		for (const { sections } of nav_list) {
			for (const { slug } of sections) {
				if (pathname !== slug && !pathname.startsWith(`${slug}/`)) continue;
				if (!best || slug.length > best.length) best = slug;
			}
		}
		return best;
	});

	function aria_current_val(path: string) {
		return active_slug === path ? 'page' : 'false';
	}
</script>

<div class="flex h-full flex-col gap-4 overflow-x-hidden overflow-y-auto p-2">
	{#if !compact}
		<a href="/" class="docs-nav-brand unstyled m-1 flex items-center gap-2 min-[968px]:m-4">
			<img src="/logo.svg" alt="Neodrag icon, a pink squircle with a paw in it" class="w-12" />
			<span>Neodrag</span>
		</a>
	{/if}

	<nav class="flex-1 px-1">
		{#each nav_list as { title, sections }, index}
			<ul class="m-0 list-none p-0">
				<div class="site-kicker mb-2">{title}</div>
				{#each sections as { slug, title }}
					<li class={compact ? 'py-0.5' : 'py-1'}>
						{#if aria_current_val(slug) === 'page'}
							<div class="dock-bevel dock-bevel-sm dock-bevel-brand">
								<a
									href={slug}
									aria-current="page"
									class="docs-nav-link docs-nav-link--active unstyled dock-bevel-fill block"
									{onclick}
								>
									{title}
								</a>
							</div>
						{:else}
							<a
								href={slug}
								aria-current="false"
								class="docs-nav-link unstyled"
								{onclick}
							>
								{title}
							</a>
						{/if}
					</li>
				{/each}
			</ul>

			{#if index !== nav_list.length - 1}
				<hr class="docs-nav-divider" aria-hidden="true" />
			{/if}
		{/each}
	</nav>
</div>
