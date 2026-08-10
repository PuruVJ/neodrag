<script lang="ts">
	import type { WorldMeta } from '../worlds';

	type Props = {
		world: WorldMeta;
	};

	const { world }: Props = $props();
</script>

<div class="grid min-h-full place-content-center justify-items-center gap-2.5 px-8 py-12 text-center">
	<p class="m-0 text-[clamp(1.5rem,4vw,2rem)] font-black tracking-tight">{world.label}</p>
	<p class="m-0 text-base font-medium text-fg/78">{world.tagline}</p>
	<p class="mt-1.5 mb-0 font-mono text-sm font-bold tracking-wider uppercase text-fg/62">
		<span aria-hidden="true">▍</span>
		ships soon — <a class="unstyled font-extrabold text-primary" href="#night-desk">night desk</a> is
		live above
	</p>
</div>
