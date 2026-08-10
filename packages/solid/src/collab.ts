// Collab for Solid. Re-exports the framework-agnostic core grammar/backends, plus a `<RoomProvider>`
// (capability primitives below it auto-join via context) and a reactive `useRoom()` for presence UI.
// Capability instances implement `CollabTarget`, so the primitives call `room.add(instance, id)` for
// you — pass an `id` and either a `room` option or a `<RoomProvider>`.
import {
	Room,
	type CollabBackend,
	type PresenceFrame,
	type RoomOptions,
} from '@neodrag/core/collab';
import { createComponent, createSignal, onCleanup, type Accessor, type JSX } from 'solid-js';
import { RoomContext, useRoomContext } from './_room-context.ts';

export * from '@neodrag/core/collab';
export { useRoomContext } from './_room-context.ts';

export type RoomProviderProps = {
	/** Use an existing room (you own its lifetime — the provider won't destroy it). */
	room?: Room;
	/** Create a room from this backend (destroyed when the provider unmounts). */
	backend?: CollabBackend;
	children?: JSX.Element;
} & RoomOptions;

/**
 * Provides a room to every capability primitive rendered below it — they auto-join (and leave on
 * cleanup). Pass `room` to share an existing one, or `backend` to have the provider create and own it.
 */
export function RoomProvider(props: RoomProviderProps): JSX.Element {
	const room =
		props.room ??
		new Room(props.backend as CollabBackend, {
			presenceThrottleMs: props.presenceThrottleMs,
			presenceTtlMs: props.presenceTtlMs,
			onRemotePresence: props.onRemotePresence,
			onRemoteOp: props.onRemoteOp,
			mirror: props.mirror,
		});
	if (!props.room) onCleanup(() => room.destroy());
	return createComponent(RoomContext.Provider, {
		value: room,
		get children() {
			return props.children;
		},
	});
}

/**
 * Reactive view of the ambient room — `peers` (connected ids) and `presences` (their in-flight
 * gestures) are accessors that update as peers join, move and leave. Use for avatars, "N editing",
 * remote cursors. Pass a room or rely on an ancestor `<RoomProvider>`.
 */
export function useRoom(room?: Room): {
	room: Room;
	peers: Accessor<readonly string[]>;
	presences: Accessor<ReadonlyMap<string, PresenceFrame>>;
} {
	const active = room ?? useRoomContext();
	if (!active) throw new Error('`useRoom()` needs a room — pass one or mount a <RoomProvider>.');
	const [peers, set_peers] = createSignal<readonly string[]>(active.peers);
	const [presences, set_presences] = createSignal<ReadonlyMap<string, PresenceFrame>>(
		active.presences,
	);
	const off = active.subscribe(() => {
		set_peers(active.peers);
		set_presences(active.presences);
	});
	onCleanup(off);
	return { room: active, peers, presences };
}
