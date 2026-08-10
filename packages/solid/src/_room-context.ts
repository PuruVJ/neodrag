import { createContext, useContext } from 'solid-js';
import type { CollabTarget, Room } from '@neodrag/core/collab';

/**
 * The room a `<RoomProvider>` supplies, or `undefined` when none is mounted (collab is opt-in, so the
 * capability primitives just skip their join). This module holds only a context handle + type-only
 * `Room` references — importing it never pulls the heavy `Room` orchestrator into the bundle (that
 * lives behind `@neodrag/solid/collab`), so `createSortable` without collab stays lean.
 */
export const RoomContext = createContext<Room>();

/**
 * Raw (non-reactive) access to the ambient room — capability primitives use this to `add` their
 * instance. For reactive presence UI (`peers`/`presences`) use `useRoom()` from `@neodrag/solid/collab`.
 */
export function useRoomContext(): Room | undefined {
	return useContext(RoomContext);
}

/**
 * Resolves the room from the `room` option or the ambient `<RoomProvider>`, and returns `join`/`leave`
 * to call from the `ref` setter, co-located with the instance create + its `onCleanup`. `leave` is the
 * per-target disposer (idempotent).
 */
export function useRoomBinding(option_room?: Room): {
	join: (instance: CollabTarget, id?: string) => void;
	leave: () => void;
} {
	const room = option_room ?? useRoomContext();
	let off: (() => void) | null = null;
	const join = (instance: CollabTarget, id?: string): void => {
		off = room?.add(instance, id) ?? null;
	};
	const leave = (): void => {
		off?.();
		off = null;
	};
	return { join, leave };
}
