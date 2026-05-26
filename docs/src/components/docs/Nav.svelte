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
			<span class="h3 m-0 text-xl">Neodrag</span>
		</a>
	{/if}

	<nav class="flex-1 px-1">
		{#each nav_list as { title, sections }, index}
			<ul class="m-0 list-none p-0">
				<div class="site-kicker mb-2">{title}</div>
				{#each sections as { slug, title }}
					<li class={compact ? 'py-0.5' : 'py-1'}>
						{#if aria_current_val(slug) === 'page'}
							<div class="dock-angular-bevel dock-angular-bevel--sm dock-angular-bevel--brand">
								<a
									href={slug}
									aria-current="page"
									class="unstyled dock-angular-bevel__fill block px-3 py-1.5 font-mono text-sm font-extrabold text-fg"
									{onclick}
								>
									{title}
								</a>
							</div>
						{:else}
							<a
								href={slug}
								aria-current="false"
								class="unstyled block px-3 py-1.5 font-mono text-sm font-semibold text-[color-mix(in_lch,var(--app-color-dark),transparent_12%)] transition-[color] duration-75 hover:text-fg"
								{onclick}
							>
								{title}
							</a>
						{/if}
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
