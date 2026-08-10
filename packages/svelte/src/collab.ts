// Collab is framework-agnostic — re-export the core grammar/backends so a Svelte app imports
// everything from `@neodrag/svelte/collab` rather than reaching into `@neodrag/core`. A capability
// joins by passing the `room` option (`new SortableList({ id, room })`) — it auto-joins on mount and
// leaves on unmount. The `Room` here is the Svelte-reactive subclass: `room.peers`/`room.presences`
// update live in markup, so presence UI needs no separate helper (use `Room.reactive(room)` only for
// a room you didn't create here). This `export { Room }` deliberately shadows core's from `export *`.
export * from '@neodrag/core/collab';
export { Room, type RoomView } from './room.svelte.ts';
