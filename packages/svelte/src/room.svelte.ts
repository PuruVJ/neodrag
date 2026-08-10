import { Room as CoreRoom, type PresenceFrame } from '@neodrag/core/collab';

/** A reactive view of a room's live multiplayer state. */
export type RoomView = {
	readonly peers: readonly string[];
	readonly presences: ReadonlyMap<string, PresenceFrame>;
};

/**
 * Svelte-reactive {@link CoreRoom}. Identical to the core `Room` (same backend, `add`, `destroy`,
 * static `bind`/`memory`/`memoryPair`) but `room.peers` and `room.presences` are `$state`-backed,
 * so reading them in markup re-renders as peers join, move and leave — no separate helper:
 *
 * ```svelte
 * const room = new Room(backend);
 * const list = new SortableList({ id: 'tasks', items, onReorder, room });
 * {#each room.peers as id}<Avatar {id} />{/each}
 * ```
 *
 * The subscription lives for the room's lifetime (it observes itself) and is torn down by
 * `destroy()`, so it needs no effect context — construct a `Room` anywhere, including module scope.
 * To get a reactive view of a room you did *not* create here (e.g. a plain core `Room`), use the
 * static {@link Room.reactive}.
 */
export class Room extends CoreRoom {
	#peers = $state<readonly string[]>([]);
	#presences = $state<ReadonlyMap<string, PresenceFrame>>(new Map());

	constructor(...args: ConstructorParameters<typeof CoreRoom>) {
		super(...args);
		this.#peers = super.peers;
		this.#presences = super.presences;
		super.subscribe(() => {
			this.#peers = super.peers;
			this.#presences = super.presences;
		});
	}

	get peers(): readonly string[] {
		return this.#peers;
	}

	get presences(): ReadonlyMap<string, PresenceFrame> {
		return this.#presences;
	}

	/**
	 * A reactive {@link RoomView} of any room — use when the room came from elsewhere as a plain core
	 * `Room` (`Room.bind`, a prop, a parent). Subscribes via an effect, so call it during component
	 * init; the subscription is cleaned up on teardown. A Svelte `Room` is already reactive, so this
	 * just hands it back.
	 */
	static reactive(room: CoreRoom): RoomView {
		if (room instanceof Room) return room;
		let peers = $state<readonly string[]>(room.peers);
		let presences = $state<ReadonlyMap<string, PresenceFrame>>(room.presences);
		$effect(() =>
			room.subscribe(() => {
				peers = room.peers;
				presences = room.presences;
			}),
		);
		return {
			get peers() {
				return peers;
			},
			get presences() {
				return presences;
			},
		};
	}
}
