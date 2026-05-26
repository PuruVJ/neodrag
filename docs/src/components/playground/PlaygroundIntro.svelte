<script lang="ts">
	import { WORLDS } from './worlds';
</script>

<header class="hp-masthead">
	<p class="hp-watermark" aria-hidden="true">NDR.</p>

	<div class="hp-masthead-main">
		<p class="hp-edition">
			<span class="hp-edition-mark" aria-hidden="true">▍</span>
			issue 003 · playground desk · 2026
		</p>

		<h1 class="hp-wordmark">
			<span class="hp-wordmark-neo">neo</span><span class="hp-wordmark-slash">/</span><span
				class="hp-wordmark-drag">drag</span
			>
		</h1>

		<div class="hp-tagline-rule" aria-hidden="true">
			<span class="hp-tagline-line"></span>
			<span class="hp-tagline-text">everything&rsquo;s a plugin</span>
			<span class="hp-tagline-line"></span>
		</div>

		<p class="hp-lede">
			Mostly built-ins, plus your own. One engine for Svelte, React, Vue, Solid, and vanilla — drag,
			drop, sort, bounds, grid, and whatever you bolt on next.
		</p>

		<nav class="hp-scenario-index" aria-label="Scenarios on this page">
			<p class="hp-scenario-index-label">
				<span aria-hidden="true">▍</span>
				scenarios — scroll or jump
			</p>
			<div class="hp-scenario-index-links">
				{#each WORLDS as world, i (world.id)}
					<a
						href="#{world.id}"
						class="hp-scenario-index-link"
						class:is-soon={!world.available}
						aria-current={world.available ? undefined : 'false'}
					>
						<span class="hp-scenario-idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
						<span class="hp-scenario-label">{world.label}</span>
						{#if !world.available}
							<span class="hp-scenario-soon">soon</span>
						{/if}
					</a>
				{/each}
			</div>
		</nav>

		<div class="hp-actions">
			<a class="hp-cta hp-cta-primary unstyled" href="/docs/svelte">Getting started</a>
			<a
				class="hp-cta hp-cta-secondary unstyled"
				href="https://github.com/PuruVJ/neodrag"
				target="_blank"
				rel="external"
			>
				GitHub
			</a>
		</div>
	</div>
</header>
