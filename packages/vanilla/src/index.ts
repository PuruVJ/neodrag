// Vanilla v3 — the core classes ARE the vanilla API (zero framework overhead). The root is the
// draggable surface; the other capabilities live at their own subpaths: `@neodrag/vanilla/sortable`,
// `/resize`, `/rotate`, `/drop`, `/collab`. The core `Interactions` engine is at `@neodrag/core`.
export { Draggable } from '@neodrag/core';
export type { DragOptions, DragEventData, Axis, BoundsInput, DragPlugin } from '@neodrag/core';

// Tier-2 `use: []` drag extensions — framework-agnostic, re-exported so they sit alongside the
// draggable (`import { Draggable, magnetic } from '@neodrag/vanilla'`). Tree-shaken away unless used.
export {
	autoScroll,
	scrollLock,
	ghost,
	haptics,
	ariaDrag,
	magnetic,
	onMove,
	type AutoScrollOptions,
	type ScrollLockOptions,
	type GhostOptions,
	type AriaDragOptions,
	type AriaDragAnnounce,
	type MagneticOptions,
	type MagneticSpring,
} from '@neodrag/core';
