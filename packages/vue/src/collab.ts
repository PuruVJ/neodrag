// Collab for Vue. Re-exports the framework-agnostic core grammar/backends, plus `provideRoom()` (an
// ancestor provides; descendant capability composables auto-join via inject) and a reactive
// `useRoom()` for presence UI. Capability instances implement `CollabTarget`, so the composables call
// `room.add(instance, id)` for you — pass an `id` and either a `room` option or `provideRoom()`.
import {
	Room,
	type CollabBackend,
	type PresenceFrame,
	type RoomOptions,
} from '@neodrag/core/collab';
import { onScopeDispose, provide, shallowRef, type ShallowRef } from 'vue';
import { injectRoom, RoomKey } from './_room-context.ts';

export * from '@neodrag/core/collab';
export { injectRoom } from './_room-context.ts';

/**
 * Provides a room to every capability composable in descendant components — they auto-join (and leave
 * on unmount). Pass an existing `Room` (you own its lifetime) or a backend (the room is created here
 * and destroyed on scope dispose). Returns the room. Call during `setup`.
 */
export function provideRoom(source: Room | CollabBackend, options?: RoomOptions): Room {
	const room = source instanceof Room ? source : new Room(source, options);
	provide(RoomKey, room);
	if (!(source instanceof Room)) onScopeDispose(() => room.destroy());
	return room;
}

/**
 * Reactive view of a room — `peers` (connected ids) and `presences` (their in-flight gestures) are
 * refs that update as peers join, move and leave. Use for avatars, "N editing", remote cursors. Pass
 * a room or rely on an ancestor `provideRoom()`. Call during `setup`.
 */
export function useRoom(room?: Room): {
	room: Room;
	peers: ShallowRef<readonly string[]>;
	presences: ShallowRef<ReadonlyMap<string, PresenceFrame>>;
} {
	const active = room ?? injectRoom();
	if (!active) {
		throw new Error('`useRoom()` needs a room — pass one or call `provideRoom()` in an ancestor.');
	}
	const peers = shallowRef<readonly string[]>(active.peers);
	const presences = shallowRef<ReadonlyMap<string, PresenceFrame>>(active.presences);
	const off = active.subscribe(() => {
		peers.value = active.peers;
		presences.value = active.presences;
	});
	onScopeDispose(off);
	return { room: active, peers, presences };
}
