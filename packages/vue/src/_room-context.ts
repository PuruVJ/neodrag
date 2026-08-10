import { inject, onScopeDispose, type InjectionKey } from 'vue';
import type { CollabTarget, Room } from '@neodrag/core/collab';

/**
 * Injection key for the ambient room. This module holds only the key + type-only `Room` references,
 * so importing it never pulls the heavy `Room` orchestrator into the bundle (that lives behind
 * `@neodrag/vue/collab`) — `useSortable` without collab stays lean.
 */
export const RoomKey: InjectionKey<Room> = Symbol('neodrag-room');

/** The room provided by an ancestor `provideRoom()`, or `undefined` if none (collab is opt-in). */
export function injectRoom(): Room | undefined {
	return inject(RoomKey, undefined);
}

/**
 * Resolves the room from the `room` option or an ancestor `provideRoom()`, and returns `join`/`leave`
 * to call from the `watch(target)` create/destroy, co-located with the instance. `leave` (the
 * per-target disposer) is also registered on scope dispose, so a composable needs no extra cleanup.
 */
export function useRoomBinding(option_room?: Room): {
	join: (instance: CollabTarget, id?: string) => void;
	leave: () => void;
} {
	const room = option_room ?? injectRoom();
	let off: (() => void) | null = null;
	const join = (instance: CollabTarget, id?: string): void => {
		off = room?.add(instance, id) ?? null;
	};
	const leave = (): void => {
		off?.();
		off = null;
	};
	onScopeDispose(leave);
	return { join, leave };
}
