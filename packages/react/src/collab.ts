// Collab for React. Re-exports the framework-agnostic core grammar/backends, plus a `<RoomProvider>`
// (capability hooks below it auto-join via context) and a reactive `useRoom()` for presence UI.
// Capability instances (`new Draggable(node, {id})`, …) implement `CollabTarget`, so the hooks call
// `room.add(instance, id)` for you — pass an `id` and either a `room` option or a `<RoomProvider>`.
import {
	Room,
	type CollabBackend,
	type PresenceFrame,
	type RoomOptions,
} from '@neodrag/core/collab';
import {
	createElement,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useSyncExternalStore,
	type ReactNode,
} from 'react';
import { RoomContext } from './_room-context.ts';

export * from '@neodrag/core/collab';
export { useRoomContext } from './_room-context.ts';

export type RoomProviderProps = {
	children?: ReactNode;
	/** Use an existing room. Mutually exclusive with `backend`; when passed, the provider won't
	 *  destroy it (you own its lifetime). */
	room?: Room;
	/** Create a room from this backend (destroyed when the provider unmounts). */
	backend?: CollabBackend;
} & RoomOptions;

/**
 * Provides a room to every capability hook rendered below it — they auto-join (and leave on unmount).
 * Pass `room` to share an existing one, or `backend` to have the provider create and own it.
 */
export function RoomProvider({ children, room, backend, ...options }: RoomProviderProps): ReactNode {
	const room_ref = useRef<Room | null>(null);
	if (room_ref.current === null) {
		room_ref.current = room ?? new Room(backend as CollabBackend, options);
	}
	const active = room_ref.current;
	// Cancel a pending destroy from a prior cleanup — React StrictMode runs setup→cleanup→setup, and
	// we must not tear down a room we immediately keep using.
	const cancel_destroy = useRef<(() => void) | null>(null);

	useEffect(() => {
		cancel_destroy.current?.();
		cancel_destroy.current = null;
		return () => {
			if (room) return; // provided room — not ours to destroy
			const id = setTimeout(() => active.destroy(), 0);
			cancel_destroy.current = () => clearTimeout(id);
		};
	}, []);

	return createElement(RoomContext.Provider, { value: active }, children);
}

/**
 * Reactive view of the ambient room. `peers` (connected ids) and `presences` (their in-flight
 * gestures) re-render via `useSyncExternalStore` as peers join, move and leave — use for avatars,
 * "N editing", remote cursors. Must be called inside a `<RoomProvider>`.
 */
export function useRoom(): {
	room: Room;
	peers: readonly string[];
	presences: ReadonlyMap<string, PresenceFrame>;
} {
	const room = useContext(RoomContext);
	if (!room) throw new Error('`useRoom()` must be called inside a <RoomProvider>.');
	const subscribe = useCallback((cb: () => void) => room.subscribe(cb), [room]);
	const peers = useSyncExternalStore(
		subscribe,
		() => room.peers,
		() => room.peers,
	);
	const presences = useSyncExternalStore(
		subscribe,
		() => room.presences,
		() => room.presences,
	);
	return { room, peers, presences };
}
