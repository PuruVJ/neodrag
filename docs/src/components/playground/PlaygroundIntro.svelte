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

<style>
	.hp-masthead {
		position: relative;
		padding: clamp(0.5rem, 2vw, 1.25rem) 0 clamp(1rem, 2.5vw, 1.75rem);
		overflow: visible;
	}

	.hp-watermark {
		position: absolute;
		top: -0.2em;
		right: -0.08em;
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(6.5rem, 22vw, 11.5rem);
		font-weight: 900;
		line-height: 0.88;
		letter-spacing: -0.08em;
		color: color-mix(in lch, var(--color-brand), transparent 78%);
		text-shadow: 0 0 80px color-mix(in lch, var(--color-brand), transparent 55%);
		pointer-events: none;
		user-select: none;
	}

	html:not([data-theme='dark']) .hp-watermark {
		color: color-mix(in lch, var(--color-brand), transparent 72%);
	}

	.hp-masthead-main {
		position: relative;
		display: grid;
		gap: 0.75rem;
		max-width: 44rem;
	}

	.hp-edition {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(0.68rem, 1.3vw, 0.76rem);
		font-weight: 700;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-fg-muted);
	}

	.hp-edition-mark {
		color: var(--color-brand);
		font-weight: 900;
	}

	.hp-wordmark {
		margin: 0;
		font-size: clamp(3.25rem, 13vw, 7.25rem);
		font-weight: 900;
		line-height: 0.88;
		letter-spacing: -0.05em;
		text-transform: lowercase;
	}

	.hp-wordmark-neo {
		font-style: italic;
		font-weight: 800;
	}

	.hp-wordmark-slash {
		color: var(--color-brand);
		font-weight: 900;
		font-style: normal;
	}

	.hp-wordmark-drag {
		border-bottom: 5px solid var(--color-brand);
		padding-bottom: 0.04em;
		font-weight: 900;
	}

	.hp-tagline-rule {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		margin: 0.15rem 0 0.1rem;
		max-width: 38rem;
	}

	.hp-tagline-line {
		flex: 1;
		height: 2px;
		min-width: 1.5rem;
		background: linear-gradient(
			90deg,
			var(--color-brand),
			color-mix(in lch, var(--color-brand), transparent 70%)
		);
	}

	.hp-tagline-rule .hp-tagline-line:last-child {
		background: linear-gradient(
			90deg,
			color-mix(in lch, var(--color-brand), transparent 70%),
			var(--color-brand)
		);
	}

	.hp-tagline-text {
		flex-shrink: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(0.68rem, 1.4vw, 0.78rem);
		font-weight: 800;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-brand);
		white-space: nowrap;
	}

	.hp-lede {
		margin: 0.2rem 0 0;
		font-size: clamp(1.05rem, 2.2vw, 1.2rem);
		font-weight: 500;
		line-height: 1.5;
		max-width: 38rem;
		color: var(--color-fg);
	}

	.hp-scenario-index {
		display: grid;
		gap: 0.55rem;
		margin-top: 0.35rem;
		padding-top: 0.85rem;
		border-top: 2px solid var(--color-border);
	}

	.hp-scenario-index-label {
		margin: 0;
		font-family: var(--app-font-mono);
		font-size: clamp(0.68rem, 1.3vw, 0.76rem);
		font-weight: 800;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--color-brand);
	}

	.hp-scenario-index-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.hp-scenario-index-link {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.45rem 0.7rem;
		font-family: var(--app-font-mono);
		font-size: clamp(0.72rem, 1.3vw, 0.8rem);
		font-weight: 700;
		text-decoration: none;
		color: var(--color-fg-muted);
		border: 2px solid var(--color-border);
		background: color-mix(in lch, var(--app-color-shell), transparent 22%);
		backdrop-filter: blur(8px);
		transition:
			border-color 75ms ease,
			color 75ms ease,
			background-color 75ms ease,
			transform 75ms ease;
	}

	.hp-scenario-index-link:hover,
	.hp-scenario-index-link:focus-visible {
		color: var(--color-fg);
		border-color: color-mix(in lch, var(--color-brand), transparent 40%);
		background: color-mix(in lch, var(--color-brand), transparent 90%);
		transform: translateY(-1px);
	}

	.hp-scenario-index-link:target,
	.hp-scenario-index-link:focus-visible {
		color: var(--color-brand);
		border-color: var(--color-brand);
	}

	.hp-scenario-index-link.is-soon {
		opacity: 0.72;
	}

	.hp-scenario-index-link .hp-scenario-idx {
		font-weight: 900;
		font-variant-numeric: tabular-nums;
		color: var(--color-fg-subtle);
	}

	.hp-scenario-index-link .hp-scenario-label {
		font-weight: 800;
	}

	.hp-scenario-index-link .hp-scenario-soon {
		font-size: 0.58rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		opacity: 0.85;
	}

	.hp-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.95rem;
	}

	.hp-cta {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.8rem 1.35rem;
		font-family: var(--app-font-mono);
		font-size: clamp(0.78rem, 1.4vw, 0.84rem);
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		transition:
			background-color 80ms ease,
			border-color 80ms ease,
			color 80ms ease,
			letter-spacing 80ms ease,
			transform 80ms ease;
	}

	.hp-cta-primary {
		color: var(--app-color-primary-contrast) !important;
		background: var(--color-brand) !important;
		background-image: none !important;
		border: 2px solid color-mix(in lch, var(--color-brand), black 18%);
	}

	.hp-cta-primary:hover,
	.hp-cta-primary:focus-visible {
		color: var(--app-color-primary-contrast) !important;
		letter-spacing: 0.12em;
		transform: translateY(-1px);
		background: color-mix(in lch, var(--color-brand), var(--app-color-anti-mixer) 10%) !important;
	}

	.hp-cta-secondary {
		color: var(--color-fg) !important;
		background: transparent !important;
		background-image: none !important;
		border: 2px solid var(--color-border-strong);
	}

	.hp-cta-secondary:hover,
	.hp-cta-secondary:focus-visible {
		color: var(--color-brand) !important;
		border-color: var(--color-brand);
		background: color-mix(in lch, var(--color-brand), transparent 90%) !important;
	}

	@media (max-width: 1100px) {
		.hp-watermark {
			font-size: clamp(5rem, 28vw, 8rem);
			opacity: 0.85;
		}
	}
</style>
