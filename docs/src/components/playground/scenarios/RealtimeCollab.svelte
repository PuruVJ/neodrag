<script lang="ts">
	import type { WorldMeta } from '../worlds';
	import {
		SortableList as CoreSortableList,
		MemoryCollab,
		bindCollab,
		SORTABLE_KEY_ATTR,
		sortableKey,
		type DndNode,
	} from '@neodrag/core';
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';

	const { world: _world }: { world: WorldMeta } = $props();

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

	// Two in-process "peers" sharing one durable op channel — no backend. A reorder on either side
	// becomes an anchor MoveOp that the other applies, so both lists converge live.
	const provA = new MemoryCollab();
	const provB = new MemoryCollab();
	provA.connect(provB);

	function pulse(set: (v: boolean) => void) {
		set(true);
		setTimeout(() => set(false), 420);
	}
	provA.onRemoteOp(() => pulse((v) => (aPulse = v)));
	provB.onRemoteOp(() => pulse((v) => (bPulse = v)));

	function peer(get: () => Task[], set: (t: Task[]) => void, prov: MemoryCollab): Attachment<DndNode> {
		return (node) => {
			const list = new CoreSortableList<Task>(node as HTMLElement, {
				get items() {
					return get();
				},
				axis: 'y',
				animation: 200,
				onReorder: (next) => set(next),
			});
			const unbind = bindCollab(list, prov);
			return () => {
				unbind();
				list.destroy();
			};
		};
	}

	const aAttach = { [createAttachmentKey()]: peer(() => aItems, (t) => (aItems = t), provA) };
	const bAttach = { [createAttachmentKey()]: peer(() => bItems, (t) => (bItems = t), provB) };

	const rowAttr = (item: Task) => ({ [SORTABLE_KEY_ATTR]: sortableKey(item) });
</script>

<div class="pg-scene collab-scene">
	<p class="pg-scene-kicker">Realtime · two peers</p>
	<p class="collab-sub">Reorder either column — the other syncs live through anchor move-ops.</p>

	<div class="collab-peers">
		<div class="collab-peer" class:is-pulse={aPulse}>
			<div class="collab-peer-head"><span class="collab-dot collab-dot--a"></span> Peer A</div>
			<ul class="collab-list" {...aAttach}>
				{#each aItems as item (item.id)}
					<li class="collab-row" {...rowAttr(item)}>{item.label}</li>
				{/each}
			</ul>
		</div>
		<div class="collab-peer" class:is-pulse={bPulse}>
			<div class="collab-peer-head"><span class="collab-dot collab-dot--b"></span> Peer B</div>
			<ul class="collab-list" {...bAttach}>
				{#each bItems as item (item.id)}
					<li class="collab-row" {...rowAttr(item)}>{item.label}</li>
				{/each}
			</ul>
		</div>
	</div>
</div>
