<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import { Draggable } from '@neodrag/svelte';
	import { SortableList } from '@neodrag/svelte/sortable';
	import { Room, MemoryBackend, type CollabBackend } from '@neodrag/svelte/collab';
	import { createCollabDebug } from './collab-debug';

	const { world: _world }: { world: WorldMeta } = $props();

	// Dev-only instrumentation → docs/.debug/collab.log. The `import.meta.env.DEV ? … : null` guard lets
	// Vite tree-shake the whole `collab-debug` module (+ its log machinery) out of the production build;
	// every call site below is a cheap `debug?.…` no-op when it's null. See collab-debug.ts.
	const debug = import.meta.env.DEV ? createCollabDebug() : null;

	type Task = { id: string; label: string };
	const INITIAL: Task[] = [
		{ id: 'design', label: 'Design' },
		{ id: 'build', label: 'Build' },
		{ id: 'review', label: 'Review' },
		{ id: 'ship', label: 'Ship' },
	];

	let aItems = $state<Task[]>(INITIAL.map((t) => ({ ...t })));
	let bItems = $state<Task[]>(INITIAL.map((t) => ({ ...t })));
	let aPulse = $state(false);
	let bPulse = $state(false);

	// Two connected in-process backends — a commit/presence frame on one round-trips to the other.
	const [backA, backB] = MemoryBackend.pair('A', 'B');

	// A little simulated network: every hop waits a fixed beat, so the sync visibly lags a step behind.
	// The delay is CONSTANT (not random) so presence frames stay in order — a random per-frame delay
	// reorders them in flight, which makes the live mirror jump backward and forward (jitter).
	const LAG_MS = 55;
	function withLag(backend: CollabBackend): CollabBackend {
		return {
			peerId: backend.peerId,
			sendOp: (op) => setTimeout(() => backend.sendOp(op), LAG_MS),
			onRemoteOp: (h) => backend.onRemoteOp((op) => setTimeout(() => h(op), LAG_MS)),
			presence: {
				publish: (f) => setTimeout(() => backend.presence.publish(f), LAG_MS),
				subscribe: (h) =>
					backend.presence.subscribe((peerId, f) => setTimeout(() => h(peerId, f), LAG_MS)),
			},
		};
	}

	function pulse(set: (v: boolean) => void) {
		set(true);
		setTimeout(() => set(false), 300);
	}

	// One peer: a reactive `SortableList` + `Draggable` (both on the shared engine) joined to a Room.
	// Dogfoods `@neodrag/svelte` — no raw `Interactions`/`Sortable`/`Drag`. Each capability joins by
	// taking the `room` option: it auto-joins under its `id` when its node mounts and leaves on
	// unmount. The two peers' lists share the id 'tasks' (one per room), which is fine here — collab
	// applies are handle-routed (no id lookup) and the demo never transfers between lists.
	// Each peer's column element — bound on mount, read lazily by the mirror getter (the columns don't
	// exist when `peer()` runs, so a plain value wouldn't resolve; a getter does, like engine `delegate`).
	let aEl = $state<HTMLElement>();
	let bEl = $state<HTMLElement>();

	function peer(
		label: string,
		items: () => Task[],
		setItems: (t: Task[]) => void,
		backend: CollabBackend,
		onOp: () => void,
		mirrorEl: () => HTMLElement | undefined,
	) {
		// `mirror` floats a styled clone of the remote-dragged row. Point it at this peer's column so the
		// clone mounts INSIDE the scoped subtree (it inherits the row styles) instead of on <body>, where
		// the playground's scoped CSS can't reach it. The getter resolves the element lazily on mount.
		const room = new Room(withLag(backend), {
			onRemoteOp: (op) => {
				debug?.op(label, op);
				onOp();
			},
			onRemotePresence: (frame) => debug?.presence(label, frame),
			get mirror() {
				return mirrorEl() ?? false;
			},
		});
		// Pass `room` and each capability auto-joins under its `id` on mount.
		const list = new SortableList<Task>({
			get items() {
				return items();
			},
			id: 'tasks',
			room,
			axis: 'y',
			animation: 200,
			onReorder: (next) => {
				debug?.reorder(
					label,
					next.map((t) => t.id),
				);
				setItems(next);
			},
		});
		const chip = new Draggable({ id: 'chip', room });
		const stopSampler = debug?.sampleMirror(label, mirrorEl);
		return {
			list,
			chip,
			destroy: () => {
				stopSampler?.();
				room.destroy();
			},
		};
	}

	const A = peer(
		'A',
		() => aItems,
		(t) => (aItems = t),
		backA,
		() => pulse((v) => (aPulse = v)),
		() => aEl,
	);
	const B = peer(
		'B',
		() => bItems,
		(t) => (bItems = t),
		backB,
		() => pulse((v) => (bPulse = v)),
		() => bEl,
	);

	$effect(() => () => {
		A.destroy();
		B.destroy();
	});

	const peerCls =
		'relative rounded-2xl border-2 bg-panel p-2 transition-[box-shadow,border-color] duration-200';
	const chipCls =
		'mt-3 cursor-grab touch-none rounded-full border border-border bg-panel px-3.5 py-1.5 text-sm select-none active:cursor-grabbing';
	const headCls =
		'mb-1.5 flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-fg/75 uppercase';
</script>

<div class="pg-scene collab-scene">
	<p class="pg-scene-kicker">Realtime · two peers</p>
	<p class="collab-sub">
		Drag a row — or the chip — in either column; the other peer follows <em>live</em>, a beat behind
		over the wire.
	</p>

	<div class="grid w-[min(26rem,92%)] grid-cols-2 gap-3">
		<div class="{peerCls} {aPulse ? 'border-brand ring-2 ring-brand/30' : 'border-border-strong'}" bind:this={aEl}>
			<div class={headCls}><span class="h-2 w-2 rounded-full bg-brand"></span> Peer A</div>
			<ul class="m-0 flex list-none flex-col gap-1.5 p-0" {...A.list.attach}>
				{#each aItems as item (item.id)}
					<li class="collab-row" {...A.list.row(item.id)}>{item.label}</li>
				{/each}
			</ul>
			<button class={chipCls} type="button" {...A.chip.attach}>drag me</button>
		</div>
		<div class="{peerCls} {bPulse ? 'border-brand ring-2 ring-brand/30' : 'border-border-strong'}" bind:this={bEl}>
			<div class={headCls}><span class="h-2 w-2 rounded-full bg-[#e0682a]"></span> Peer B</div>
			<ul class="m-0 flex list-none flex-col gap-1.5 p-0" {...B.list.attach}>
				{#each bItems as item (item.id)}
					<li class="collab-row" {...B.list.row(item.id)}>{item.label}</li>
				{/each}
			</ul>
			<button class={chipCls} type="button" {...B.chip.attach}>drag me</button>
		</div>
	</div>
</div>

<style>
	/* A row mirroring the other peer's in-flight drag — a JS-toggled mirror state, kept as CSS. */
	.collab-row.is-remote {
		position: relative;
		z-index: 5;
		cursor: default;
		border-color: var(--color-brand);
		border-style: dashed;
		box-shadow: 0 10px 24px -14px color-mix(in lch, var(--color-fg), transparent 35%);
		transition: translate 0.14s ease;
	}
</style>
