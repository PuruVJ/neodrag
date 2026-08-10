import { createContext, useCallback, useContext, useRef } from 'react';
import type { CollabTarget, Room } from '@neodrag/core/collab';

/**
 * The room a `<RoomProvider>` supplies, or `null` when none is mounted (collab is opt-in, so the
 * capability hooks just skip their join). This module holds only a context handle and type-only
 * `Room` references — importing it never pulls the heavy `Room` orchestrator into the bundle (that
 * lives behind `@neodrag/react/collab`), so `useSortable` without collab stays lean.
 */
export const RoomContext = createContext<Room | null>(null);

/**
 * Raw (non-reactive) access to the ambient room — capability hooks use this to `add` their instance.
 * For reactive presence UI (`peers`/`presences`) use `useRoom()` from `@neodrag/react/collab`.
 */
export function useRoomContext(): Room | null {
	return useContext(RoomContext);
}

/**
 * Binds a capability instance into its room. Resolves the room from the `room` option or the ambient
 * `<RoomProvider>` and returns stable `join`/`leave` to call from the ref callback, co-located with
 * the instance's create/destroy. `leave` is the per-target disposer (idempotent, so React
 * StrictMode's mount→unmount→mount can't double-emit).
 */
export function useRoomBinding(option_room?: Room): {
	join: (instance: CollabTarget, id?: string) => void;
	leave: () => void;
} {
	const ctx_room = useContext(RoomContext);
	const room_ref = useRef<Room | null>(null);
	room_ref.current = option_room ?? ctx_room;
	const off_ref = useRef<(() => void) | null>(null);

	const join = useCallback((instance: CollabTarget, id?: string) => {
		off_ref.current = room_ref.current?.add(instance, id) ?? null;
	}, []);
	const leave = useCallback(() => {
		off_ref.current?.();
		off_ref.current = null;
	}, []);

	return { join, leave };
}
